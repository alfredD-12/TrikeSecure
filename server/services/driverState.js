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

function buildStatusOrder(orderedValues) {
  return orderedValues
    .map((value, index) => `WHEN '${value}' THEN ${index}`)
    .join('\n          ');
}

function getDriverAccessMessage(driverState) {
  if (!driverState || !driverState.driverId) {
    return 'Complete your driver onboarding to access ride operations.';
  }

  if (driverState.membershipStatus !== 'approved') {
    return 'Your TODA membership is not approved yet.';
  }

  if (!driverState.tricycleId || !driverState.franchiseId) {
    return 'Submit your tricycle details and franchise application first.';
  }

  if (driverState.tricycleStatus !== 'approved' || driverState.franchiseStatus !== 'approved') {
    return 'Your tricycle franchise is not approved yet.';
  }

  return null;
}

function determineOnboardingStep(driverState, ownedToda) {
  if (ownedToda && ownedToda.status !== 'approved') {
    return 'toda_review';
  }

  if (!driverState || !driverState.driverId || driverState.membershipStatus === 'not_applied') {
    return 'start';
  }

  if (driverState.membershipStatus === 'pending' || driverState.membershipStatus === 'rejected') {
    return 'membership_review';
  }

  if (driverState.membershipStatus !== 'approved') {
    return 'start';
  }

  if (!driverState.tricycleId || !driverState.franchiseId) {
    return 'franchise_application';
  }

  if (driverState.franchiseStatus === 'approved' && driverState.tricycleStatus === 'approved') {
    return 'active';
  }

  return 'franchise_review';
}

async function getDriverAccessContext(executor, userId) {
  const [rows] = await executor.query(
    `
      SELECT
        u.user_id AS userId,
        u.full_name AS fullName,
        u.email,
        u.status AS accountStatus,
        d.driver_id AS driverId,
        d.toda_id AS todaId,
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
        td.toda_name AS todaName,
        td.status AS todaStatus,
        t.tricycle_id AS tricycleId,
        t.body_number AS bodyNumber,
        t.plate_number AS plateNumber,
        t.make_model AS makeModel,
        t.color,
        t.engine_number AS engineNumber,
        t.chassis_number AS chassisNumber,
        t.qr_code_value AS qrCodeValue,
        t.status AS tricycleStatus,
        t.franchise_expiry AS franchiseExpiry,
        latest_franchise.franchise_id AS franchiseId,
        latest_franchise.status AS franchiseStatus,
        latest_franchise.toda_certificate_document AS todaCertificateDocument,
        latest_franchise.or_cr_document AS orCrDocument,
        latest_franchise.insurance_document AS insuranceDocument,
        latest_franchise.issue_date AS franchiseIssueDate,
        latest_franchise.expiry_date AS franchiseExpiryDate,
        latest_franchise.lgu_reference_no AS lguReferenceNo,
        latest_franchise.reviewed_at AS franchiseReviewedAt,
        latest_franchise.remarks AS franchiseRemarks
      FROM users u
      LEFT JOIN drivers d ON d.user_id = u.user_id
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
      WHERE u.user_id = ?
      ORDER BY
        CASE d.membership_status
          ${buildStatusOrder(['approved', 'pending', 'rejected', 'not_applied'])}
          ELSE 4
        END,
        CASE t.status
          ${buildStatusOrder(['approved', 'pending', 'rejected', 'expired', 'suspended'])}
          ELSE 5
        END,
        t.updated_at DESC,
        d.updated_at DESC
      LIMIT 1
    `,
    [userId],
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
}

async function getOwnedToda(executor, userId) {
  const [rows] = await executor.query(
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
        reviewer.full_name AS reviewedByName
      FROM todas t
      LEFT JOIN users reviewer ON reviewer.user_id = t.reviewed_by_user_id
      WHERE t.president_user_id = ?
      ORDER BY
        CASE t.status
          ${buildStatusOrder(['pending', 'approved', 'rejected', 'inactive'])}
          ELSE 4
        END,
        t.submitted_at DESC
      LIMIT 1
    `,
    [userId],
  );

  return rows[0] || null;
}

async function countPendingMembershipRequests(executor, todaId, excludedDriverId = null) {
  if (!todaId) {
    return 0;
  }

  const [rows] = await executor.query(
    `
      SELECT COUNT(*) AS pendingCount
      FROM drivers
      WHERE toda_id = ?
        AND membership_status = 'pending'
        AND (? IS NULL OR driver_id <> ?)
    `,
    [todaId, excludedDriverId, excludedDriverId],
  );

  return Number(rows[0]?.pendingCount || 0);
}

async function getDriverDashboardState(executor, userId) {
  const driverState = await getDriverAccessContext(executor, userId);
  const ownedToda = await getOwnedToda(executor, userId);
  const accessMessage = getDriverAccessMessage(driverState);
  const onboardingStep = determineOnboardingStep(driverState, ownedToda);

  let pendingMembershipRequests = 0;
  if (
    driverState?.driverId &&
    driverState?.todaId &&
    driverState.membershipRole === 'president' &&
    driverState.membershipStatus === 'approved'
  ) {
    pendingMembershipRequests = await countPendingMembershipRequests(executor, driverState.todaId, driverState.driverId);
  }

  return {
    ...(driverState || {
      userId,
      driverId: null,
      todaId: null,
      membershipRole: 'member',
      membershipStatus: 'not_applied',
      licenseNumber: '',
      licenseExpiryDate: null,
      contactNumber: '',
      driverLicenseDocument: null,
      validIdDocument: null,
      membershipAppliedAt: null,
      membershipReviewedAt: null,
      membershipRemarks: null,
      todaName: null,
      todaStatus: null,
      tricycleId: null,
      bodyNumber: null,
      plateNumber: null,
      makeModel: null,
      color: null,
      engineNumber: null,
      chassisNumber: null,
      qrCodeValue: null,
      tricycleStatus: null,
      franchiseExpiry: null,
      franchiseId: null,
      franchiseStatus: null,
      todaCertificateDocument: null,
      orCrDocument: null,
      insuranceDocument: null,
      franchiseIssueDate: null,
      franchiseExpiryDate: null,
      lguReferenceNo: null,
      franchiseReviewedAt: null,
      franchiseRemarks: null,
    }),
    ownedToda,
    onboardingStep,
    canOperate: !accessMessage,
    accessMessage,
    presidentToolsEnabled: Boolean(
      driverState?.membershipRole === 'president'
      && driverState?.membershipStatus === 'approved'
      && driverState?.todaId,
    ),
    pendingMembershipRequests,
  };
}

async function listApprovedTodas(executor) {
  const [rows] = await executor.query(
    `
      SELECT
        t.toda_id AS todaId,
        t.toda_name AS todaName,
        t.toda_code AS todaCode,
        t.barangay,
        t.municipality,
        t.route_description AS routeDescription,
        president.full_name AS presidentFullName,
        (
          SELECT COUNT(*)
          FROM drivers d
          WHERE d.toda_id = t.toda_id AND d.membership_status = 'approved'
        ) AS approvedMembers
      FROM todas t
      INNER JOIN users president ON president.user_id = t.president_user_id
      WHERE t.status = 'approved'
      ORDER BY t.toda_name ASC
    `,
  );

  return rows;
}

async function getPresidentScope(executor, userId) {
  const [rows] = await executor.query(
    `
      SELECT
        d.driver_id AS driverId,
        d.toda_id AS todaId,
        t.toda_name AS todaName
      FROM drivers d
      INNER JOIN todas t ON t.toda_id = d.toda_id
      WHERE d.user_id = ?
        AND d.membership_role = 'president'
        AND d.membership_status = 'approved'
        AND t.status = 'approved'
      LIMIT 1
    `,
    [userId],
  );

  return rows[0] || null;
}

module.exports = {
  getDriverAccessContext,
  getDriverAccessMessage,
  getDriverDashboardState,
  getOwnedToda,
  getPresidentScope,
  listApprovedTodas,
  normalizeDateInput,
  normalizeOptionalText,
};
