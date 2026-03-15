const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/rides/request — create a new ride request
router.post('/request', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  const pickup = typeof req.body.pickup === 'string' ? req.body.pickup.trim() : '';
  const dropoff = typeof req.body.dropoff === 'string' ? req.body.dropoff.trim() : '';

  if (!pickup) {
    return res.status(400).json({ message: 'Pickup location is required.' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO ride_requests (pickup_location, dropoff_location, status)
       VALUES (?, ?, 'waiting')`,
      [pickup, dropoff || null]
    );

    res.status(201).json({
      requestId: result.insertId,
      status: 'waiting',
      message: 'Ride request created.',
    });
  } catch (err) {
    console.error('Ride request error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
