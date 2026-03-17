const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/sos — Create an emergency SOS alert
router.post('/', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  const { latitude, longitude, rideId, message } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ message: 'Location coordinates are required.' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO sos_alerts (user_id, user_role, latitude, longitude, ride_id, message, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [
        req.session.userId,
        req.session.role,
        parseFloat(latitude),
        parseFloat(longitude),
        rideId || null,
        message || null,
      ]
    );

    console.log(`🚨 SOS ALERT #${result.insertId} from ${req.session.role} ${req.session.username} at (${latitude}, ${longitude})`);

    res.status(201).json({
      alertId: result.insertId,
      status: 'active',
      message: 'SOS alert sent successfully.',
    });
  } catch (err) {
    console.error('SOS alert error:', err);
    res.status(500).json({ message: 'Server error creating SOS alert.' });
  }
});

module.exports = router;
