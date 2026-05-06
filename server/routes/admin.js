const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth, requireRole } = require('../auth/sessionAuth');
const ridesRouter = require('./rides');

router.use(requireAuth, requireRole('admin'));

function parsePositiveInt(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizeOptionalText(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function normalizeDateInput(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

router.get('/overview', async (_req, res) => {
  try {
    const [[stats]] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM todas WHERE status = 'pending') AS pendingTodaApplications,
        (SELECT COUNT(*) FROM todas WHERE status = 'approved') AS approvedTodas,
        (SELECT COUNT(*) FROM drivers WHERE membership_status = 'pending') AS pendingMembershipApplications,
        (SELECT COUNT(*) FROM drivers WHERE membership_status = 'approved') AS activeDrivers,
        (SELECT COUNT(*) FROM franchises WHERE status = 'pending') AS pendingFranchises,
        (SELECT COUNT(*) FROM franchises WHERE status = 'approved') AS approvedFranchises,
        (SELECT COUNT(*) FROM tricycles WHERE status = 'approved') AS activeTricycles,
        (SELECT COUNT(*) FROM ride_requests WHERE status IN ('waiting', 'accepted', 'arrived', 'in_progress')) AS liveRides,
        (SELECT COUNT(*) FROM ride_requests WHERE DATE(request_time) = CURDATE()) AS todaysRides,
        (SELECT COUNT(*) FROM complaints WHERE status = 'pending') AS openComplaints
    `);

    const [recentActivity] = await db.query(`
      SELECT
        activity_type AS activityType,
        activity_status AS activityStatus,
        message,
        occurred_at AS occurredAt
      FROM (
        SELECT
          'toda_application' AS activity_type,
          t.status AS activity_status,
          CONCAT('TODA application submitted: ', t.toda_name) AS message,
          t.submitted_at AS occurred_at
        FROM todas t

        UNION ALL

        SELECT
          'toda_review' AS activity_type,
          t.status AS activity_status,
          CONCAT('TODA review completed: ', t.toda_name, ' (', t.status, ')') AS message,
          t.reviewed_at AS occurred_at
        FROM todas t
        WHERE t.reviewed_at IS NOT NULL

        UNION ALL

        SELECT
          'membership_application' AS activity_type,
          d.membership_status AS activity_status,
          CONCAT(u.full_name, ' applied for membership to ', COALESCE(td.toda_name, 'a TODA')) AS message,
          d.membership_applied_at AS occurred_at
        FROM drivers d
        INNER JOIN users u ON u.user_id = d.user_id
        LEFT JOIN todas td ON td.toda_id = d.toda_id
        WHERE d.membership_applied_at IS NOT NULL

        UNION ALL

        SELECT
          'membership_review' AS activity_type,
          d.membership_status AS activity_status,
          CONCAT('Membership update for ', u.full_name, ': ', d.membership_status) AS message,
          d.membership_reviewed_at AS occurred_at
        FROM drivers d
        INNER JOIN users u ON u.user_id = d.user_id
        WHERE d.membership_reviewed_at IS NOT NULL

        UNION ALL

        SELECT
          'franchise_application' AS activity_type,
          f.status AS activity_status,
          CONCAT('Franchise application submitted for ', COALESCE(NULLIF(t.body_number, ''), t.plate_number)) AS message,
          f.created_at AS occurred_at
        FROM franchises f
        INNER JOIN tricycles t ON t.tricycle_id = f.tricycle_id

        UNION ALL

        SELECT
          'franchise_review' AS activity_type,
          f.status AS activity_status,
          CONCAT('Franchise review completed for ', COALESCE(NULLIF(t.body_number, ''), t.plate_number), ' (', f.status, ')') AS message,
          f.reviewed_at AS occurred_at
        FROM franchises f
        INNER JOIN tricycles t ON t.tricycle_id = f.tricycle_id
        WHERE f.reviewed_at IS NOT NULL

        UNION ALL

        SELECT
          'ride' AS activity_type,
          r.status AS activity_status,
          CONCAT('Ride request from ', commuter.full_name, ' is ', r.status) AS message,
          r.request_time AS occurred_at
        FROM ride_requests r
        INNER JOIN users commuter ON commuter.user_id = r.commuter_id

        UNION ALL

        SELECT
          'complaint' AS activity_type,
          c.status AS activity_status,
          CONCAT('Complaint reported: ', COALESCE(c.complaint_type, 'General')) AS message,
          c.date_reported AS occurred_at
        FROM complaints c
      ) activity_feed
      WHERE occurred_at IS NOT NULL
      ORDER BY occurred_at DESC
      LIMIT 12
    `);

    return res.json({ stats, recentActivity });
  } catch (error) {
    console.error('Admin overview error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

router.get('/todas', async (req, res) => {
  const statusFilter = normalizeOptionalText(req.query.status);

  try {
    const [rows] = await db.query(
      `
        SELECT
          t.toda_id AS todaId,
          t.toda_name AS todaName,
          t.toda_code AS todaCode,
          t.barangay,
          t.municipality,
          t.route_description AS routeDescription,
          t.letter_of_intent_document AS letterOfIntentDocument,
          t.officers_list_document AS officersListDocument,
          t.members_list_document AS membersListDocument,
          t.barangay_approval_document AS barangayApprovalDocument,
          t.status,
          t.submitted_at AS submittedAt,
          t.reviewed_at AS reviewedAt,
          t.review_remarks AS reviewRemarks,
          t.approved_at AS approvedAt,
          president.user_id AS presidentUserId,
          president.full_name AS presidentFullName,
          president.email AS presidentEmail,
          pd.driver_license_document AS presidentDriverLicenseDocument,
          pd.valid_id_document AS presidentValidIdDocument,
          pd.license_number AS presidentLicenseNumber,
          reviewer.full_name AS reviewedByName,
          (
            SELECT COUNT(*)
            FROM drivers d
            WHERE d.toda_id = t.toda_id AND d.membership_status = 'approved'
          ) AS approvedMembers
        FROM todas t
        INNER JOIN users president ON president.user_id = t.president_user_id
        LEFT JOIN drivers pd ON pd.user_id = t.president_user_id
        LEFT JOIN users reviewer ON reviewer.user_id = t.reviewed_by_user_id
        WHERE (? IS NULL OR t.status = ?)
        ORDER BY
          CASE t.status
            WHEN 'pending' THEN 0
            WHEN 'approved' THEN 1
            WHEN 'rejected' THEN 2
            ELSE 3
          END,
          t.submitted_at DESC
      `,
      [statusFilter, statusFilter],
    );

    return res.json(rows);
  } catch (error) {
    console.error('Admin TODA list error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

router.patch('/todas/:id/review', async (req, res) => {
  const todaId = parsePositiveInt(req.params.id);
  const nextStatus = normalizeOptionalText(req.body.status);
  const reviewRemarks = normalizeOptionalText(req.body.remarks);

  if (!todaId) {
    return res.status(400).json({ message: 'Invalid TODA ID.' });
  }

  if (!['approved', 'rejected', 'inactive'].includes(nextStatus)) {
    return res.status(400).json({ message: 'Status must be approved, rejected, or inactive.' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [existingRows] = await conn.query(
      `
        SELECT
          toda_id AS todaId,
          president_user_id AS presidentUserId
        FROM todas
        WHERE toda_id = ?
        LIMIT 1
        FOR UPDATE
      `,
      [todaId],
    );

    if (existingRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'TODA application not found.' });
    }

    const toda = existingRows[0];

    await conn.query(
      `
        UPDATE todas
        SET
          status = ?,
          reviewed_by_user_id = ?,
          reviewed_at = NOW(),
          review_remarks = ?
        WHERE toda_id = ?
      `,
      [nextStatus, req.session.userId, reviewRemarks, todaId],
    );

    if (nextStatus === 'approved') {
      const [driverRows] = await conn.query(
        `
          SELECT driver_id AS driverId
          FROM drivers
          WHERE user_id = ?
          LIMIT 1
          FOR UPDATE
        `,
        [toda.presidentUserId],
      );

      if (driverRows.length > 0) {
        await conn.query(
          `
            UPDATE drivers
            SET
              toda_id = ?,
              membership_role = 'president',
              membership_status = 'approved',
              membership_applied_at = COALESCE(membership_applied_at, NOW()),
              membership_reviewed_at = NOW(),
              membership_reviewed_by_user_id = ?,
              membership_remarks = ?
            WHERE driver_id = ?
          `,
          [
            todaId,
            req.session.userId,
            reviewRemarks || 'Approved automatically when the TODA application was approved by the LGU.',
            driverRows[0].driverId,
          ],
        );
      }
    }

    await conn.commit();

    const [rows] = await db.query(
      `
        SELECT
          toda_id AS todaId,
          toda_name AS todaName,
          status,
          reviewed_at AS reviewedAt,
          review_remarks AS reviewRemarks,
          approved_at AS approvedAt
        FROM todas
        WHERE toda_id = ?
        LIMIT 1
      `,
      [todaId],
    );

    return res.json({
      message: `TODA application ${nextStatus}.`,
      toda: rows[0],
    });
  } catch (error) {
    await conn.rollback();
    console.error('Admin TODA review error:', error);
    return res.status(500).json({ message: error.message || 'Server error.' });
  } finally {
    conn.release();
  }
});

router.get('/drivers', async (req, res) => {
  const membershipStatus = normalizeOptionalText(req.query.membershipStatus);
  const todaId = parsePositiveInt(req.query.todaId);

  try {
    const [rows] = await db.query(
      `
        SELECT
          d.driver_id AS driverId,
          u.user_id AS userId,
          u.full_name AS fullName,
          u.username,
          u.email,
          u.status AS accountStatus,
          d.membership_role AS membershipRole,
          d.membership_status AS membershipStatus,
          d.license_number AS licenseNumber,
          d.license_expiry_date AS licenseExpiryDate,
          d.contact_number AS contactNumber,
          d.driver_license_document AS driverLicenseDocument,
          d.valid_id_document AS validIdDocument,
          d.membership_applied_at AS membershipAppliedAt,
          d.membership_reviewed_at AS membershipReviewedAt,
          d.membership_remarks AS membershipRemarks,
          td.toda_id AS todaId,
          td.toda_name AS todaName,
          t.tricycle_id AS tricycleId,
          t.body_number AS bodyNumber,
          t.plate_number AS plateNumber,
          t.qr_code_value AS qrCodeValue,
          t.status AS tricycleStatus,
          t.franchise_expiry AS franchiseExpiry,
          latest_franchise.franchise_id AS franchiseId,
          latest_franchise.status AS franchiseStatus,
          latest_franchise.issue_date AS franchiseIssueDate,
          latest_franchise.expiry_date AS franchiseExpiryDate,
          latest_franchise.lgu_reference_no AS lguReferenceNo
        FROM drivers d
        INNER JOIN users u ON u.user_id = d.user_id
        LEFT JOIN todas td ON td.toda_id = d.toda_id
        LEFT JOIN tricycles t ON t.driver_id = d.driver_id
        LEFT JOIN (
          SELECT f1.*
          FROM franchises f1
          INNER JOIN (
            SELECT tricycle_id, MAX(franchise_id) AS latest_franchise_id
            FROM franchises
            GROUP BY tricycle_id
          ) latest ON latest.latest_franchise_id = f1.franchise_id
        ) latest_franchise ON latest_franchise.tricycle_id = t.tricycle_id
        WHERE
          (? IS NULL OR d.membership_status = ?)
          AND (? IS NULL OR d.toda_id = ?)
        ORDER BY
          CASE d.membership_status
            WHEN 'pending' THEN 0
            WHEN 'approved' THEN 1
            WHEN 'rejected' THEN 2
            ELSE 3
          END,
          u.full_name ASC,
          t.updated_at DESC
      `,
      [membershipStatus, membershipStatus, todaId, todaId],
    );

    return res.json(rows);
  } catch (error) {
    console.error('Admin drivers list error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

router.get('/franchises', async (req, res) => {
  const statusFilter = normalizeOptionalText(req.query.status);

  try {
    const [rows] = await db.query(
      `
        SELECT
          f.franchise_id AS franchiseId,
          f.status,
          f.toda_certificate_document AS todaCertificateDocument,
          f.or_cr_document AS orCrDocument,
          f.insurance_document AS insuranceDocument,
          f.issue_date AS issueDate,
          f.expiry_date AS expiryDate,
          f.lgu_reference_no AS lguReferenceNo,
          f.reviewed_at AS reviewedAt,
          f.remarks,
          f.created_at AS createdAt,
          reviewer.full_name AS reviewedByName,
          t.tricycle_id AS tricycleId,
          t.body_number AS bodyNumber,
          t.plate_number AS plateNumber,
          t.status AS tricycleStatus,
          td.toda_id AS todaId,
          td.toda_name AS todaName,
          d.driver_id AS driverId,
          d.membership_status AS membershipStatus,
          u.full_name AS driverFullName,
          u.email AS driverEmail
        FROM franchises f
        INNER JOIN tricycles t ON t.tricycle_id = f.tricycle_id
        INNER JOIN drivers d ON d.driver_id = t.driver_id
        INNER JOIN users u ON u.user_id = d.user_id
        LEFT JOIN todas td ON td.toda_id = t.toda_id
        LEFT JOIN users reviewer ON reviewer.user_id = f.reviewed_by_user_id
        WHERE (? IS NULL OR f.status = ?)
        ORDER BY
          CASE f.status
            WHEN 'pending' THEN 0
            WHEN 'approved' THEN 1
            WHEN 'rejected' THEN 2
            WHEN 'expired' THEN 3
            ELSE 4
          END,
          f.created_at DESC
      `,
      [statusFilter, statusFilter],
    );

    return res.json(rows);
  } catch (error) {
    console.error('Admin franchises list error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

router.patch('/franchises/:id/review', async (req, res) => {
  const franchiseId = parsePositiveInt(req.params.id);
  const nextStatus = normalizeOptionalText(req.body.status);
  const remarks = normalizeOptionalText(req.body.remarks);
  const issueDate = normalizeDateInput(req.body.issueDate);
  const expiryDate = normalizeDateInput(req.body.expiryDate);
  const lguReferenceNo = normalizeOptionalText(req.body.lguReferenceNo);

  if (!franchiseId) {
    return res.status(400).json({ message: 'Invalid franchise ID.' });
  }

  if (!['approved', 'rejected', 'expired', 'revoked'].includes(nextStatus)) {
    return res.status(400).json({ message: 'Status must be approved, rejected, expired, or revoked.' });
  }

  if (nextStatus === 'approved' && (!issueDate || !expiryDate || !lguReferenceNo)) {
    return res.status(400).json({
      message: 'Approved franchises require issueDate, expiryDate, and lguReferenceNo.',
    });
  }

  try {
    const [existingRows] = await db.query(
      'SELECT franchise_id FROM franchises WHERE franchise_id = ? LIMIT 1',
      [franchiseId],
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'Franchise application not found.' });
    }

    if (nextStatus === 'approved') {
      await db.query(
        `
          UPDATE franchises
          SET
            status = ?,
            issue_date = ?,
            expiry_date = ?,
            lgu_reference_no = ?,
            reviewed_by_user_id = ?,
            reviewed_at = NOW(),
            remarks = ?
          WHERE franchise_id = ?
        `,
        [nextStatus, issueDate, expiryDate, lguReferenceNo, req.session.userId, remarks, franchiseId],
      );
    } else {
      await db.query(
        `
          UPDATE franchises
          SET
            status = ?,
            reviewed_by_user_id = ?,
            reviewed_at = NOW(),
            remarks = ?
          WHERE franchise_id = ?
        `,
        [nextStatus, req.session.userId, remarks, franchiseId],
      );
    }

    const [rows] = await db.query(
      `
        SELECT
          franchise_id AS franchiseId,
          status,
          issue_date AS issueDate,
          expiry_date AS expiryDate,
          lgu_reference_no AS lguReferenceNo,
          reviewed_at AS reviewedAt,
          remarks
        FROM franchises
        WHERE franchise_id = ?
        LIMIT 1
      `,
      [franchiseId],
    );

    return res.json({
      message: `Franchise application ${nextStatus}.`,
      franchise: rows[0],
    });
  } catch (error) {
    console.error('Admin franchise review error:', error);
    return res.status(500).json({ message: error.message || 'Server error.' });
  }
});

router.get('/rides/live', async (_req, res) => {
  const LIVE = ['waiting', 'accepted', 'arrived', 'in_progress'];
  const placeholders = LIVE.map(() => '?').join(', ');
  try {
    const [rows] = await db.query(
      `SELECT
          r.request_id AS requestId,
          r.pickup_location AS pickupLocation,
          r.dropoff_location AS dropoffLocation,
          r.pickup_lat AS pickupLat,
          r.pickup_lng AS pickupLng,
          r.dropoff_lat AS dropoffLat,
          r.dropoff_lng AS dropoffLng,
          r.fare_amount AS fareAmount,
          r.request_time AS requestTime,
          r.status,
          commuter.full_name AS commuterName,
          driver_user.full_name AS driverName,
          d.driver_id AS driverId,
          t.body_number AS bodyNumber,
          t.plate_number AS plateNumber,
          td.toda_name AS todaName
        FROM ride_requests r
        INNER JOIN users commuter ON commuter.user_id = r.commuter_id
        LEFT JOIN drivers d ON d.driver_id = r.assigned_driver_id
        LEFT JOIN users driver_user ON driver_user.user_id = d.user_id
        LEFT JOIN tricycles t ON t.driver_id = d.driver_id AND t.status = 'approved'
        LEFT JOIN todas td ON td.toda_id = d.toda_id
        WHERE r.status IN (${placeholders})
        ORDER BY
          CASE r.status
            WHEN 'in_progress' THEN 0
            WHEN 'arrived' THEN 1
            WHEN 'accepted' THEN 2
            WHEN 'waiting' THEN 3
          END,
          r.request_time DESC`,
      LIVE,
    );

    const driverLocations = ridesRouter.getDriverLocations();
    const rides = rows.map(row => {
      const loc = row.driverId ? driverLocations.get(row.driverId) : null;
      return {
        ...row,
        driverLat: loc ? loc.lat : null,
        driverLng: loc ? loc.lng : null,
        driverLocationAge: loc ? Math.round((Date.now() - loc.updatedAtMs) / 1000) : null,
      };
    });

    return res.json(rides);
  } catch (error) {
    console.error('Admin live rides error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

router.get('/rides', async (req, res) => {
  const statusFilter = normalizeOptionalText(req.query.status);

  try {
    const [rows] = await db.query(
      `
        SELECT
          r.request_id AS requestId,
          r.pickup_location AS pickupLocation,
          r.dropoff_location AS dropoffLocation,
          r.pickup_lat AS pickupLat,
          r.pickup_lng AS pickupLng,
          r.dropoff_lat AS dropoffLat,
          r.dropoff_lng AS dropoffLng,
          r.fare_amount AS fareAmount,
          r.request_time AS requestTime,
          r.status,
          commuter.full_name AS commuterName,
          commuter.email AS commuterEmail,
          driver_user.full_name AS driverName,
          t.body_number AS bodyNumber,
          t.plate_number AS plateNumber,
          td.toda_name AS todaName
        FROM ride_requests r
        INNER JOIN users commuter ON commuter.user_id = r.commuter_id
        LEFT JOIN drivers d ON d.driver_id = r.assigned_driver_id
        LEFT JOIN users driver_user ON driver_user.user_id = d.user_id
        LEFT JOIN tricycles t ON t.driver_id = d.driver_id AND t.status = 'approved'
        LEFT JOIN todas td ON td.toda_id = d.toda_id
        WHERE (? IS NULL OR r.status = ?)
        ORDER BY r.request_time DESC
        LIMIT 200
      `,
      [statusFilter, statusFilter],
    );

    return res.json(rows);
  } catch (error) {
    console.error('Admin rides list error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

router.get('/complaints', async (req, res) => {
  const statusFilter = normalizeOptionalText(req.query.status);

  try {
    const [rows] = await db.query(
      `
        SELECT
          c.complaint_id AS complaintId,
          c.complaint_type AS complaintType,
          c.description,
          c.date_reported AS dateReported,
          c.status,
          d.driver_id AS driverId,
          user_driver.full_name AS driverName,
          t.tricycle_id AS tricycleId,
          t.body_number AS bodyNumber,
          t.plate_number AS plateNumber,
          td.toda_name AS todaName
        FROM complaints c
        INNER JOIN drivers d ON d.driver_id = c.driver_id
        INNER JOIN users user_driver ON user_driver.user_id = d.user_id
        INNER JOIN tricycles t ON t.tricycle_id = c.tricycle_id
        LEFT JOIN todas td ON td.toda_id = t.toda_id
        WHERE (? IS NULL OR c.status = ?)
        ORDER BY c.date_reported DESC
        LIMIT 200
      `,
      [statusFilter, statusFilter],
    );

    return res.json(rows);
  } catch (error) {
    console.error('Admin complaints list error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

router.patch('/complaints/:id/resolve', async (req, res) => {
  const complaintId = parsePositiveInt(req.params.id);

  if (!complaintId) {
    return res.status(400).json({ message: 'Invalid complaint ID.' });
  }

  try {
    const [result] = await db.query(
      `
        UPDATE complaints
        SET status = 'resolved'
        WHERE complaint_id = ? AND status <> 'resolved'
      `,
      [complaintId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Complaint not found or already resolved.' });
    }

    return res.json({ message: 'Complaint marked as resolved.' });
  } catch (error) {
    console.error('Admin complaint resolve error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

/* ── GET /admin/ratings — All ride ratings ── */
router.get('/ratings', async (req, res) => {
  try {
    const [ratings] = await db.query(
      `SELECT rr.rating_id, rr.rating_value, rr.feedback, rr.created_at,
              u_commuter.full_name AS commuter_name,
              u_driver.full_name   AS driver_name,
              t.body_number,
              t.plate_number,
              toda.toda_name,
              d.driver_id
       FROM ride_ratings rr
       JOIN users u_commuter ON rr.commuter_id = u_commuter.user_id
       JOIN drivers d         ON rr.driver_id   = d.driver_id
       JOIN users u_driver    ON d.user_id       = u_driver.user_id
       LEFT JOIN tricycles t  ON d.driver_id     = t.driver_id
       LEFT JOIN todas toda ON toda.toda_id = d.toda_id
       ORDER BY rr.created_at DESC`
    );
    return res.json(ratings);
  } catch (error) {
    console.error('Admin ratings fetch error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
