const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const router = express.Router();
const db = require('../db');
const { requireAuth, requireRole } = require('../auth/sessionAuth');
const {
  NASUGBU_BARANGAYS,
  NASUGBU_PSGC_MUNICIPALITY_CODE,
  findNasugbuBarangayByCode,
} = require('../data/nasugbuBarangays');
const {
  getDriverDashboardState,
  getPresidentScope,
  listApprovedTodas,
  normalizeDateInput,
  normalizeOptionalText,
} = require('../services/driverState');

router.use(requireAuth, requireRole('driver'));

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');
const DOCUMENT_UPLOAD_DIR = path.join(UPLOAD_ROOT, 'driver-documents');
const ALLOWED_UPLOAD_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

fs.mkdirSync(DOCUMENT_UPLOAD_DIR, { recursive: true });

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, DOCUMENT_UPLOAD_DIR);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const safeExtension = extension || '';
    callback(null, `${Date.now()}-${crypto.randomUUID()}${safeExtension}`);
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: {
    fileSize: 12 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_UPLOAD_MIME_TYPES.has(file.mimetype)) {
      callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
      return;
    }

    callback(null, true);
  },
});

const TODA_MEMBERS_LIST_PLACEHOLDER = 'Not required for Nasugbu TODA registration.';

function parsePositiveInt(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function requireFields(res, fields) {
  const missing = fields.find((field) => !field.value);
  if (!missing) {
    return false;
  }

  res.status(400).json({ message: missing.message });
  return true;
}

function handleUploadFields(fields) {
  return (req, res, next) => {
    upload.fields(fields)(req, res, (error) => {
      if (!error) {
        return next();
      }

      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'Uploaded files must be 12 MB or smaller.' });
        }

        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ message: 'One of the uploaded files uses an unsupported format.' });
        }

        return res.status(400).json({ message: 'Unable to process uploaded documents.' });
      }

      return next(error);
    });
  };
}

function getUploadedDocumentValue(req, fieldName) {
  const uploadedFile = req.files?.[fieldName]?.[0];
  if (uploadedFile) {
    return `/uploads/driver-documents/${uploadedFile.filename}`;
  }

  return normalizeOptionalText(req.body[fieldName]);
}

function isDuplicateKeyError(error) {
  return error?.code === 'ER_DUP_ENTRY';
}

function getDuplicateFieldMessage(error, fallbackMessage) {
  const message = String(error?.message || '');

  if (message.includes('license_number')) {
    return 'That driver license number is already linked to another account.';
  }

  if (message.includes('toda_name')) {
    return 'That TODA name is already in use.';
  }

  if (message.includes('toda_code')) {
    return 'That TODA code is already in use.';
  }

  if (message.includes('body_number')) {
    return 'That body number is already assigned to another tricycle.';
  }

  if (message.includes('plate_number')) {
    return 'That plate number is already assigned to another tricycle.';
  }

  if (message.includes('qr_code_value')) {
    return 'That QR code value is already assigned to another tricycle.';
  }

  return fallbackMessage;
}

function buildTodaCodeSegment(barangayName) {
  const raw = String(barangayName || '').trim().toUpperCase();
  if (!raw) {
    return 'NAS';
  }

  if (raw.startsWith('BARANGAY ')) {
    const suffix = raw.slice('BARANGAY '.length).replace(/[^A-Z0-9]+/g, '');
    return suffix ? `BRGY${suffix}` : 'BRGY';
  }

  const words = raw
    .replace(/[^A-Z0-9\s]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return 'NAS';
  }

  if (words.length === 1) {
    return words[0].slice(0, 5);
  }

  return words
    .slice(0, 4)
    .map((word) => word[0])
    .join('');
}

async function generateTodaCode(executor, barangayName) {
  const segment = buildTodaCodeSegment(barangayName);
  const prefix = `NSG-${segment}`;
  const [rows] = await executor.query(
    `
      SELECT toda_code AS todaCode
      FROM todas
      WHERE toda_code LIKE ?
    `,
    [`${prefix}-%`],
  );

  const nextNumber = rows.reduce((highest, row) => {
    const match = String(row.todaCode || '').match(/-(\d+)$/);
    if (!match) {
      return highest;
    }

    return Math.max(highest, Number(match[1]));
  }, 0) + 1;

  return `${prefix}-${String(nextNumber).padStart(3, '0')}`;
}

router.get('/onboarding', async (req, res) => {
  try {
    const state = await getDriverDashboardState(db, req.session.userId);
    return res.json(state);
  } catch (error) {
    console.error('Driver onboarding state error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

router.get('/todas', async (_req, res) => {
  try {
    const rows = await listApprovedTodas(db);
    return res.json(rows);
  } catch (error) {
    console.error('Approved TODA list error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

router.get('/reference/nasugbu-barangays', (_req, res) => {
  return res.json({
    province: 'Batangas',
    municipality: 'Nasugbu',
    municipalityCode: NASUGBU_PSGC_MUNICIPALITY_CODE,
    barangays: NASUGBU_BARANGAYS,
  });
});

router.get('/reference/toda-code-preview', async (req, res) => {
  const barangayCode = normalizeOptionalText(req.query.barangayCode);
  const barangay = findNasugbuBarangayByCode(barangayCode);

  if (!barangay) {
    return res.status(400).json({ message: 'Select a valid Nasugbu barangay first.' });
  }

  try {
    const todaCode = await generateTodaCode(db, barangay.name);
    return res.json({
      todaCode,
      barangay,
      municipality: 'Nasugbu',
      province: 'Batangas',
    });
  } catch (error) {
    console.error('TODA code preview error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

router.post('/membership-application', handleUploadFields([
  { name: 'driverLicenseDocument', maxCount: 1 },
  { name: 'validIdDocument', maxCount: 1 },
]), async (req, res) => {
  const todaId = parsePositiveInt(req.body.todaId);
  const licenseNumber = normalizeOptionalText(req.body.licenseNumber);
  const licenseExpiryDate = normalizeDateInput(req.body.licenseExpiryDate);
  const contactNumber = normalizeOptionalText(req.body.contactNumber);
  const driverLicenseDocument = getUploadedDocumentValue(req, 'driverLicenseDocument');
  const validIdDocument = getUploadedDocumentValue(req, 'validIdDocument');

  if (requireFields(res, [
    { value: todaId, message: 'Select an approved TODA first.' },
    { value: licenseNumber, message: 'Driver license number is required.' },
    { value: driverLicenseDocument, message: 'Driver license document is required.' },
    { value: validIdDocument, message: 'Valid ID document is required.' },
  ])) {
    return;
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [todaRows] = await conn.query(
      'SELECT toda_id FROM todas WHERE toda_id = ? AND status = ? LIMIT 1',
      [todaId, 'approved'],
    );

    if (todaRows.length === 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Only approved TODAs can accept members.' });
    }

    const dashboardState = await getDriverDashboardState(conn, req.session.userId);

    if (dashboardState.ownedToda && ['pending', 'approved', 'inactive'].includes(dashboardState.ownedToda.status)) {
      await conn.rollback();
      return res.status(409).json({ message: 'This account already owns a TODA application and cannot join another TODA.' });
    }

    if (dashboardState.membershipStatus === 'approved') {
      await conn.rollback();
      return res.status(409).json({ message: 'This driver account is already an approved TODA member.' });
    }

    if (dashboardState.driverId) {
      await conn.query(
        `
          UPDATE drivers
          SET
            toda_id = ?,
            membership_role = 'member',
            membership_status = 'pending',
            license_number = ?,
            license_expiry_date = ?,
            contact_number = ?,
            driver_license_document = ?,
            valid_id_document = ?,
            membership_applied_at = NOW(),
            membership_reviewed_at = NULL,
            membership_reviewed_by_user_id = NULL,
            membership_remarks = NULL
          WHERE driver_id = ?
        `,
        [
          todaId,
          licenseNumber,
          licenseExpiryDate,
          contactNumber,
          driverLicenseDocument,
          validIdDocument,
          dashboardState.driverId,
        ],
      );
    } else {
      await conn.query(
        `
          INSERT INTO drivers (
            user_id,
            toda_id,
            membership_role,
            membership_status,
            license_number,
            license_expiry_date,
            contact_number,
            driver_license_document,
            valid_id_document,
            membership_applied_at
          )
          VALUES (?, ?, 'member', 'pending', ?, ?, ?, ?, ?, NOW())
        `,
        [
          req.session.userId,
          todaId,
          licenseNumber,
          licenseExpiryDate,
          contactNumber,
          driverLicenseDocument,
          validIdDocument,
        ],
      );
    }

    await conn.commit();
    const state = await getDriverDashboardState(db, req.session.userId);
    return res.status(201).json({
      message: 'Membership application submitted.',
      state,
    });
  } catch (error) {
    await conn.rollback();
    console.error('Driver membership application error:', error);

    if (isDuplicateKeyError(error)) {
      return res.status(409).json({
        message: getDuplicateFieldMessage(error, 'That driver record conflicts with an existing account.'),
      });
    }

    return res.status(500).json({ message: error.message || 'Server error.' });
  } finally {
    conn.release();
  }
});

router.post('/toda-application', handleUploadFields([
  { name: 'letterOfIntentDocument', maxCount: 1 },
  { name: 'officersListDocument', maxCount: 1 },
  { name: 'barangayApprovalDocument', maxCount: 1 },
  { name: 'driverLicenseDocument', maxCount: 1 },
  { name: 'validIdDocument', maxCount: 1 },
]), async (req, res) => {
  const todaName = normalizeOptionalText(req.body.todaName);
  const barangayCode = normalizeOptionalText(req.body.barangayCode);
  const routeDescription = normalizeOptionalText(req.body.routeDescription);
  const letterOfIntentDocument = getUploadedDocumentValue(req, 'letterOfIntentDocument');
  const officersListDocument = getUploadedDocumentValue(req, 'officersListDocument');
  const barangayApprovalDocument = getUploadedDocumentValue(req, 'barangayApprovalDocument');
  const licenseNumber = normalizeOptionalText(req.body.licenseNumber);
  const licenseExpiryDate = normalizeDateInput(req.body.licenseExpiryDate);
  const contactNumber = normalizeOptionalText(req.body.contactNumber);
  const driverLicenseDocument = getUploadedDocumentValue(req, 'driverLicenseDocument');
  const validIdDocument = getUploadedDocumentValue(req, 'validIdDocument');
  const barangay = findNasugbuBarangayByCode(barangayCode);

  if (requireFields(res, [
    { value: todaName, message: 'TODA name is required.' },
    { value: barangay, message: 'Select a valid Nasugbu barangay.' },
    { value: routeDescription, message: 'Route description is required.' },
    { value: letterOfIntentDocument, message: 'Letter of Intent is required.' },
    { value: officersListDocument, message: 'Officers List is required.' },
    { value: barangayApprovalDocument, message: 'Barangay Approval is required.' },
    { value: licenseNumber, message: 'Driver license number is required.' },
    { value: driverLicenseDocument, message: 'Driver license document is required.' },
    { value: validIdDocument, message: 'Valid ID document is required.' },
  ])) {
    return;
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [existingTodaRows] = await conn.query(
      `
        SELECT
          toda_id AS todaId,
          toda_code AS todaCode,
          barangay,
          status
        FROM todas
        WHERE president_user_id = ?
        ORDER BY submitted_at DESC, toda_id DESC
        LIMIT 1
        FOR UPDATE
      `,
      [req.session.userId],
    );

    const existingToda = existingTodaRows[0] || null;

    if (existingToda && ['pending', 'approved', 'inactive'].includes(existingToda.status)) {
      await conn.rollback();
      return res.status(409).json({ message: 'This account already has an active or pending TODA application.' });
    }

    const dashboardState = await getDriverDashboardState(conn, req.session.userId);

    if (dashboardState.membershipStatus === 'approved' && dashboardState.todaId) {
      await conn.rollback();
      return res.status(409).json({ message: 'An approved TODA member cannot register a new TODA from this account.' });
    }

    if (dashboardState.membershipStatus === 'pending') {
      await conn.rollback();
      return res.status(409).json({ message: 'Resolve the current TODA membership application before registering a TODA.' });
    }

    if (dashboardState.driverId) {
      await conn.query(
        `
          UPDATE drivers
          SET
            toda_id = NULL,
            membership_role = 'president',
            membership_status = 'not_applied',
            license_number = ?,
            license_expiry_date = ?,
            contact_number = ?,
            driver_license_document = ?,
            valid_id_document = ?,
            membership_applied_at = NULL,
            membership_reviewed_at = NULL,
            membership_reviewed_by_user_id = NULL,
            membership_remarks = NULL
          WHERE driver_id = ?
        `,
        [
          licenseNumber,
          licenseExpiryDate,
          contactNumber,
          driverLicenseDocument,
          validIdDocument,
          dashboardState.driverId,
        ],
      );
    } else {
      await conn.query(
        `
          INSERT INTO drivers (
            user_id,
            membership_role,
            membership_status,
            license_number,
            license_expiry_date,
            contact_number,
            driver_license_document,
            valid_id_document
          )
          VALUES (?, 'president', 'not_applied', ?, ?, ?, ?, ?)
        `,
        [
          req.session.userId,
          licenseNumber,
          licenseExpiryDate,
          contactNumber,
          driverLicenseDocument,
          validIdDocument,
        ],
      );
    }

    const todaCode = existingToda?.todaCode && existingToda.barangay === barangay.name
      ? existingToda.todaCode
      : await generateTodaCode(conn, barangay.name);

    if (existingToda && existingToda.status === 'rejected') {
      await conn.query(
        `
          UPDATE todas
          SET
            toda_name = ?,
            toda_code = ?,
            barangay = ?,
            municipality = 'Nasugbu, Batangas',
            route_description = ?,
            letter_of_intent_document = ?,
            officers_list_document = ?,
            members_list_document = ?,
            barangay_approval_document = ?,
            status = 'pending',
            submitted_at = NOW(),
            reviewed_at = NULL,
            reviewed_by_user_id = NULL,
            review_remarks = NULL,
            approved_at = NULL
          WHERE toda_id = ?
        `,
        [
          todaName,
          todaCode,
          barangay.name,
          routeDescription,
          letterOfIntentDocument,
          officersListDocument,
          TODA_MEMBERS_LIST_PLACEHOLDER,
          barangayApprovalDocument,
          existingToda.todaId,
        ],
      );
    } else {
      await conn.query(
        `
          INSERT INTO todas (
            toda_name,
            toda_code,
            president_user_id,
            barangay,
            municipality,
            route_description,
            letter_of_intent_document,
            officers_list_document,
            members_list_document,
            barangay_approval_document
          )
          VALUES (?, ?, ?, ?, 'Nasugbu, Batangas', ?, ?, ?, ?, ?)
        `,
        [
          todaName,
          todaCode,
          req.session.userId,
          barangay.name,
          routeDescription,
          letterOfIntentDocument,
          officersListDocument,
          TODA_MEMBERS_LIST_PLACEHOLDER,
          barangayApprovalDocument,
        ],
      );
    }

    await conn.commit();
    const state = await getDriverDashboardState(db, req.session.userId);
    return res.status(201).json({
      message: 'TODA application submitted.',
      state,
    });
  } catch (error) {
    await conn.rollback();
    console.error('Driver TODA application error:', error);

    if (isDuplicateKeyError(error)) {
      return res.status(409).json({
        message: getDuplicateFieldMessage(error, 'That TODA application conflicts with an existing record.'),
      });
    }

    return res.status(500).json({ message: error.message || 'Server error.' });
  } finally {
    conn.release();
  }
});

router.get('/membership-requests', async (req, res) => {
  const statusFilter = normalizeOptionalText(req.query.status) || 'pending';

  if (!['pending', 'approved', 'rejected'].includes(statusFilter)) {
    return res.status(400).json({ message: 'Invalid membership status filter.' });
  }

  try {
    const presidentScope = await getPresidentScope(db, req.session.userId);
    if (!presidentScope) {
      return res.status(403).json({ message: 'Only approved TODA presidents can review membership requests.' });
    }

    const [rows] = await db.query(
      `
        SELECT
          d.driver_id AS driverId,
          d.user_id AS userId,
          u.full_name AS fullName,
          u.email,
          d.membership_role AS membershipRole,
          d.membership_status AS membershipStatus,
          d.license_number AS licenseNumber,
          d.license_expiry_date AS licenseExpiryDate,
          d.contact_number AS contactNumber,
          d.driver_license_document AS driverLicenseDocument,
          d.valid_id_document AS validIdDocument,
          d.membership_applied_at AS membershipAppliedAt,
          d.membership_reviewed_at AS membershipReviewedAt,
          d.membership_remarks AS membershipRemarks
        FROM drivers d
        INNER JOIN users u ON u.user_id = d.user_id
        WHERE d.toda_id = ?
          AND d.driver_id <> ?
          AND d.membership_status = ?
        ORDER BY
          CASE d.membership_status
            WHEN 'pending' THEN 0
            WHEN 'approved' THEN 1
            WHEN 'rejected' THEN 2
            ELSE 3
          END,
          d.membership_applied_at DESC,
          u.full_name ASC
      `,
      [presidentScope.todaId, presidentScope.driverId, statusFilter],
    );

    return res.json({
      todaId: presidentScope.todaId,
      todaName: presidentScope.todaName,
      requests: rows,
    });
  } catch (error) {
    console.error('President membership request list error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

router.patch('/membership-requests/:driverId/review', async (req, res) => {
  const targetDriverId = parsePositiveInt(req.params.driverId);
  const nextStatus = normalizeOptionalText(req.body.status);
  const remarks = normalizeOptionalText(req.body.remarks);

  if (!targetDriverId) {
    return res.status(400).json({ message: 'Invalid driver ID.' });
  }

  if (!['approved', 'rejected'].includes(nextStatus)) {
    return res.status(400).json({ message: 'Status must be approved or rejected.' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const presidentScope = await getPresidentScope(conn, req.session.userId);
    if (!presidentScope) {
      await conn.rollback();
      return res.status(403).json({ message: 'Only approved TODA presidents can review membership requests.' });
    }

    const [targetRows] = await conn.query(
      `
        SELECT
          driver_id AS driverId,
          toda_id AS todaId,
          membership_status AS membershipStatus
        FROM drivers
        WHERE driver_id = ?
        LIMIT 1
        FOR UPDATE
      `,
      [targetDriverId],
    );

    if (targetRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Membership application not found.' });
    }

    const target = targetRows[0];

    if (target.driverId === presidentScope.driverId) {
      await conn.rollback();
      return res.status(400).json({ message: 'You cannot review your own membership record here.' });
    }

    if (target.todaId !== presidentScope.todaId) {
      await conn.rollback();
      return res.status(404).json({ message: 'That membership request is not assigned to your TODA.' });
    }

    if (target.membershipStatus !== 'pending') {
      await conn.rollback();
      return res.status(409).json({ message: 'Only pending membership applications can be reviewed.' });
    }

    await conn.query(
      `
        UPDATE drivers
        SET
          membership_status = ?,
          membership_reviewed_at = NOW(),
          membership_reviewed_by_user_id = ?,
          membership_remarks = ?
        WHERE driver_id = ?
      `,
      [nextStatus, req.session.userId, remarks, targetDriverId],
    );

    await conn.commit();
    return res.json({
      message: `Membership application ${nextStatus}.`,
    });
  } catch (error) {
    await conn.rollback();
    console.error('President membership review error:', error);
    return res.status(500).json({ message: error.message || 'Server error.' });
  } finally {
    conn.release();
  }
});

router.post('/franchise-application', handleUploadFields([
  { name: 'todaCertificateDocument', maxCount: 1 },
  { name: 'orCrDocument', maxCount: 1 },
  { name: 'insuranceDocument', maxCount: 1 },
]), async (req, res) => {
  const bodyNumber = normalizeOptionalText(req.body.bodyNumber);
  const plateNumber = normalizeOptionalText(req.body.plateNumber);
  const makeModel = normalizeOptionalText(req.body.makeModel);
  const color = normalizeOptionalText(req.body.color);
  const engineNumber = normalizeOptionalText(req.body.engineNumber);
  const chassisNumber = normalizeOptionalText(req.body.chassisNumber);
  const qrCodeValue = normalizeOptionalText(req.body.qrCodeValue);
  const todaCertificateDocument = getUploadedDocumentValue(req, 'todaCertificateDocument');
  const orCrDocument = getUploadedDocumentValue(req, 'orCrDocument');
  const insuranceDocument = getUploadedDocumentValue(req, 'insuranceDocument');

  if (requireFields(res, [
    { value: plateNumber, message: 'Plate number is required.' },
    { value: todaCertificateDocument, message: 'TODA certificate document is required.' },
    { value: orCrDocument, message: 'OR/CR document is required.' },
    { value: insuranceDocument, message: 'Insurance document is required.' },
  ])) {
    return;
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const dashboardState = await getDriverDashboardState(conn, req.session.userId);
    if (!dashboardState.driverId) {
      await conn.rollback();
      return res.status(400).json({ message: 'Create your driver profile or TODA membership first.' });
    }

    if (dashboardState.membershipStatus !== 'approved' || !dashboardState.todaId) {
      await conn.rollback();
      return res.status(403).json({ message: 'Only approved TODA members can apply for a franchise.' });
    }

    let tricycleId = dashboardState.tricycleId;

    if (tricycleId) {
      await conn.query(
        `
          UPDATE tricycles
          SET
            toda_id = ?,
            body_number = ?,
            plate_number = ?,
            make_model = ?,
            color = ?,
            engine_number = ?,
            chassis_number = ?,
            qr_code_value = ?,
            status = 'pending',
            franchise_expiry = NULL
          WHERE tricycle_id = ?
        `,
        [
          dashboardState.todaId,
          bodyNumber,
          plateNumber,
          makeModel,
          color,
          engineNumber,
          chassisNumber,
          qrCodeValue,
          tricycleId,
        ],
      );
    } else {
      const [insertResult] = await conn.query(
        `
          INSERT INTO tricycles (
            driver_id,
            toda_id,
            body_number,
            plate_number,
            make_model,
            color,
            engine_number,
            chassis_number,
            qr_code_value,
            status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `,
        [
          dashboardState.driverId,
          dashboardState.todaId,
          bodyNumber,
          plateNumber,
          makeModel,
          color,
          engineNumber,
          chassisNumber,
          qrCodeValue,
        ],
      );

      tricycleId = insertResult.insertId;
    }

    const [pendingFranchiseRows] = await conn.query(
      `
        SELECT franchise_id AS franchiseId
        FROM franchises
        WHERE tricycle_id = ? AND status = 'pending'
        ORDER BY franchise_id DESC
        LIMIT 1
      `,
      [tricycleId],
    );

    if (pendingFranchiseRows.length > 0) {
      await conn.query(
        `
          UPDATE franchises
          SET
            toda_certificate_document = ?,
            or_cr_document = ?,
            insurance_document = ?,
            status = 'pending',
            issue_date = NULL,
            expiry_date = NULL,
            lgu_reference_no = NULL,
            reviewed_at = NULL,
            reviewed_by_user_id = NULL,
            remarks = NULL
          WHERE franchise_id = ?
        `,
        [
          todaCertificateDocument,
          orCrDocument,
          insuranceDocument,
          pendingFranchiseRows[0].franchiseId,
        ],
      );
    } else {
      await conn.query(
        `
          INSERT INTO franchises (
            tricycle_id,
            status,
            toda_certificate_document,
            or_cr_document,
            insurance_document
          )
          VALUES (?, 'pending', ?, ?, ?)
        `,
        [tricycleId, todaCertificateDocument, orCrDocument, insuranceDocument],
      );
    }

    await conn.commit();
    const state = await getDriverDashboardState(db, req.session.userId);
    return res.status(201).json({
      message: 'Franchise application submitted.',
      state,
    });
  } catch (error) {
    await conn.rollback();
    console.error('Driver franchise application error:', error);

    if (isDuplicateKeyError(error)) {
      return res.status(409).json({
        message: getDuplicateFieldMessage(error, 'That tricycle record conflicts with an existing application.'),
      });
    }

    return res.status(500).json({ message: error.message || 'Server error.' });
  } finally {
    conn.release();
  }
});

module.exports = router;
