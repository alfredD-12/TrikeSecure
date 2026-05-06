const express = require('express');
const router = express.Router();
const db = require('../db');
const { getAccountRole, requireAuth } = require('../auth/sessionAuth');

// POST /api/sos - Create an emergency SOS alert
router.post('/', requireAuth, async (req, res) => {
  const { latitude, longitude, rideId, message } = req.body;
  const accountRole = getAccountRole(req);

  if (!['commuter', 'driver'].includes(accountRole)) {
    return res.status(403).json({ message: 'Only drivers and commuters can send SOS alerts.' });
  }

  const hasLatitude = latitude !== undefined && latitude !== null && latitude !== '';
  const hasLongitude = longitude !== undefined && longitude !== null && longitude !== '';
  const parsedLatitude = hasLatitude ? Number(latitude) : null;
  const parsedLongitude = hasLongitude ? Number(longitude) : null;

  if (
    (hasLatitude && (!Number.isFinite(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90))
    || (hasLongitude && (!Number.isFinite(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180))
    || (hasLatitude !== hasLongitude)
  ) {
    return res.status(400).json({ message: 'Invalid location coordinates.' });
  }

  const parsedRideId = Number.parseInt(rideId, 10);
  const normalizedRideId = Number.isInteger(parsedRideId) && parsedRideId > 0 ? parsedRideId : null;

  try {
    const [result] = await db.query(
      `
        INSERT INTO sos_alerts (user_id, user_role, latitude, longitude, ride_id, message, status)
        VALUES (?, ?, ?, ?, ?, ?, 'active')
      `,
      [
        req.session.userId,
        accountRole,
        parsedLatitude,
        parsedLongitude,
        normalizedRideId,
        message || null,
      ],
    );

    console.log(
      `SOS ALERT #${result.insertId} from ${accountRole} ${req.session.username}`
      + (normalizedRideId ? ` ride #${normalizedRideId}` : '')
      + (parsedLatitude !== null ? ` at (${parsedLatitude}, ${parsedLongitude})` : ' without GPS coordinates')
    );

    return res.status(201).json({
      alertId: result.insertId,
      status: 'active',
      message: 'SOS alert sent successfully.',
    });
  } catch (error) {
    console.error('SOS alert error:', error);
    return res.status(500).json({ message: 'Server error creating SOS alert.' });
  }
});

router.get('/history', requireAuth, async (req, res) => {
  const userId = req.session?.userId;
  const { limit = 20, offset = 0 } = req.query;

  try {
    const [rows] = await db.query(
      `
        SELECT
          s.alert_id,
          s.latitude,
          s.longitude,
          s.ride_id,
          s.message,
          s.created_at,
          s.status
        FROM sos_alerts s
        WHERE s.user_id = ?
        ORDER BY s.created_at DESC
        LIMIT ? OFFSET ?
      `,
      [userId, Number(limit) || 20, Number(offset) || 0]
    );

    const alerts = rows.map((row) => ({
      id: row.alert_id,
      latitude: row.latitude,
      longitude: row.longitude,
      rideId: row.ride_id,
      message: row.message,
      createdAt: row.created_at,
      status: row.status,
    }));

    res.json({ alerts });
  } catch (error) {
    console.error('SOS history error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
