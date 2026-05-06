const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../auth/sessionAuth');

router.use(requireAuth);

router.get('/qr/:value', async (req, res) => {
  const rawValue = typeof req.params.value === 'string' ? req.params.value.trim() : '';
  const decodedValue = decodeURIComponent(rawValue);

  if (!decodedValue) {
    return res.status(400).json({ message: 'QR value is required.' });
  }

  try {
    const [rows] = await db.query(
      `
        SELECT
          t.tricycle_id,
          t.body_number,
          t.plate_number,
          t.qr_code_value,
          td.toda_name,
          t.status AS tricycle_status,
          t.franchise_expiry,
          d.driver_id,
          d.license_number,
          d.contact_number,
          d.membership_status,
          d.membership_role,
          u.user_id,
          u.full_name,
          u.username,
          u.status AS user_status,
          f.lgu_reference_no
        FROM tricycles t
        INNER JOIN drivers d ON d.driver_id = t.driver_id
        INNER JOIN users u ON u.user_id = d.user_id
        LEFT JOIN todas td ON td.toda_id = t.toda_id
        LEFT JOIN franchises f ON f.tricycle_id = t.tricycle_id
        WHERE t.qr_code_value = ? OR t.body_number = ?
        LIMIT 1
      `,
      [decodedValue, decodedValue],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No tricycle record found for this QR code.' });
    }

    const record = rows[0];
    return res.json({
      tricycleId: record.tricycle_id,
      bodyNumber: record.body_number,
      plateNumber: record.plate_number,
      qrCodeValue: record.qr_code_value,
      todaName: record.toda_name || '',
      lguReferenceNo: record.lgu_reference_no || '',
      tricycleStatus: record.tricycle_status,
      franchiseExpiry: record.franchise_expiry,
      driver: {
        id: record.driver_id,
        fullName: record.full_name,
        username: record.username,
        licenseNumber: record.license_number,
        contactNumber: record.contact_number,
        status: record.membership_status,
        membershipStatus: record.membership_status,
        membershipRole: record.membership_role,
      },
      userStatus: record.user_status,
    });
  } catch (error) {
    console.error('QR scan error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
