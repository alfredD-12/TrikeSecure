const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../auth/sessionAuth');

router.use(requireAuth);

router.get('/drivers/search', async (req, res) => {
  const { plateNumber } = req.query;
  const searchQuery = plateNumber ? `%${plateNumber}%` : '%';

  try {
    const [rows] = await db.query(
      `
        SELECT
          t.tricycle_id,
          t.body_number,
          t.plate_number,
          t.make_model,
          t.color,
          t.status AS tricycle_status,
          t.franchise_expiry,
          d.driver_id,
          d.license_number,
          d.contact_number,
          d.membership_status,
          u.user_id,
          u.full_name,
          td.toda_name,
          f.issue_date AS franchise_issue_date,
          f.expiry_date AS franchise_expiry_date,
          f.lgu_reference_no
        FROM tricycles t
        INNER JOIN drivers d ON d.driver_id = t.driver_id
        INNER JOIN users u ON u.user_id = d.user_id
        LEFT JOIN todas td ON td.toda_id = t.toda_id
        LEFT JOIN franchises f ON f.tricycle_id = t.tricycle_id AND f.status = 'approved'
        WHERE t.plate_number LIKE ? AND t.status = 'approved'
        ORDER BY t.plate_number ASC
        LIMIT 10
      `,
      [searchQuery]
    );

    const drivers = rows.map((row) => ({
      tricycleId: row.tricycle_id,
      bodyNumber: row.body_number,
      plateNumber: row.plate_number,
      makeModel: row.make_model,
      color: row.color,
      tricycleStatus: row.tricycle_status,
      franchiseExpiry: row.franchise_expiry,
      franchiseIssueDate: row.franchise_issue_date,
      franchiseExpiryDate: row.franchise_expiry_date,
      lguReferenceNo: row.lgu_reference_no,
      driverId: row.driver_id,
      fullName: row.full_name,
      contactNumber: row.contact_number,
      licenseNumber: row.license_number,
      membershipStatus: row.membership_status,
      todaName: row.toda_name || '',
    }));

    res.json({ drivers });
  } catch (error) {
    console.error('Driver search error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.post('/', async (req, res) => {
  const { tricycleId, driverId, complaintType, description } = req.body;
  const commuterId = req.session?.userId;

  if (!tricycleId || !driverId) {
    return res.status(400).json({ message: 'Tricycle and driver are required.' });
  }

  if (!complaintType) {
    return res.status(400).json({ message: 'Complaint type is required.' });
  }

  if (!description || !description.trim()) {
    return res.status(400).json({ message: 'Incident description is required.' });
  }

  try {
    const [result] = await db.query(
      `
        INSERT INTO complaints (commuter_id, tricycle_id, driver_id, complaint_type, description)
        VALUES (?, ?, ?, ?, ?)
      `,
      [commuterId, tricycleId, driverId, complaintType, description.trim()]
    );

    res.json({
      message: 'Complaint submitted successfully.',
      complaintId: result.insertId,
    });
  } catch (error) {
    console.error('Complaint submission error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.get('/history', async (req, res) => {
  const userId = req.session?.userId;
  const { limit = 20, offset = 0 } = req.query;

  try {
    const [rows] = await db.query(
      `
        SELECT
          c.complaint_id,
          c.complaint_type,
          c.description,
          c.date_reported,
          c.status,
          t.body_number,
          t.plate_number,
          u.full_name AS driver_name
        FROM complaints c
        LEFT JOIN tricycles t ON t.tricycle_id = c.tricycle_id
        LEFT JOIN drivers d ON d.driver_id = c.driver_id
        LEFT JOIN users u ON u.user_id = d.user_id
        WHERE c.commuter_id = ?
        ORDER BY c.date_reported DESC
        LIMIT ? OFFSET ?
      `,
      [userId, Number(limit) || 20, Number(offset) || 0]
    );

    const complaints = rows.map((row) => ({
      id: row.complaint_id,
      complaintType: row.complaint_type,
      description: row.description,
      dateReported: row.date_reported,
      status: row.status,
      driver: {
        name: row.driver_name,
        bodyNumber: row.body_number,
        plateNumber: row.plate_number,
      },
    }));

    res.json({ complaints });
  } catch (error) {
    console.error('Complaint history error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;