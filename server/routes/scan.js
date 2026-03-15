const express = require('express');
const router = express.Router();
const db = require('../db');

function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }
  return next();
}

router.use(requireAuth);

router.get('/qr/:value', async (req, res) => {
  const rawValue = typeof req.params.value === 'string' ? req.params.value.trim() : '';
  const decodedValue = decodeURIComponent(rawValue);

  if (!decodedValue) {
    return res.status(400).json({ message: 'QR value is required.' });
  }

  try {
    const [rows] = await db.query(
      `SELECT
         t.tricycle_id,
         t.body_number,
         t.plate_number,
         t.qr_code_value,
         t.toda_name AS tricycle_toda,
         t.status AS tricycle_status,
         t.franchise_expiry,
         d.driver_id,
         d.license_number,
         d.contact_number,
         d.toda_name AS driver_toda,
         d.status AS driver_status,
         u.user_id,
         u.full_name,
         u.username,
         u.status AS user_status
       FROM tricycles t
       INNER JOIN drivers d ON d.driver_id = t.driver_id
       INNER JOIN users u ON u.user_id = d.user_id
       WHERE t.qr_code_value = ? OR t.body_number = ?
       LIMIT 1`,
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
      todaName: record.tricycle_toda || record.driver_toda || '',
      tricycleStatus: record.tricycle_status,
      franchiseExpiry: record.franchise_expiry,
      driver: {
        id: record.driver_id,
        fullName: record.full_name,
        username: record.username,
        licenseNumber: record.license_number,
        contactNumber: record.contact_number,
        status: record.driver_status,
      },
      userStatus: record.user_status,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
