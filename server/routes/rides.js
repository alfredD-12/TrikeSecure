const express = require('express');
const router = express.Router();
const db = require('../db');

// ── Middleware helpers ───────────────────────────────────────
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.session.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role.' });
    }
    next();
  };
}

// ── POST /api/rides/request — commuter creates a ride request ──
router.post('/request', requireAuth, requireRole('commuter'), async (req, res) => {
  const pickup = typeof req.body.pickup === 'string' ? req.body.pickup.trim() : '';
  const dropoff = typeof req.body.dropoff === 'string' ? req.body.dropoff.trim() : '';
  const pickupLat = typeof req.body.pickupLat === 'number' ? req.body.pickupLat : null;
  const pickupLng = typeof req.body.pickupLng === 'number' ? req.body.pickupLng : null;

  if (!pickup) {
    return res.status(400).json({ message: 'Pickup location is required.' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO ride_requests (commuter_id, pickup_location, dropoff_location, pickup_lat, pickup_lng, status)
       VALUES (?, ?, ?, ?, ?, 'waiting')`,
      [req.session.userId, pickup, dropoff || '', pickupLat, pickupLng]
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

// ── POST /api/rides/:id/cancel — commuter cancels their own waiting request ──
router.post('/:id/cancel', requireAuth, requireRole('commuter'), async (req, res) => {
  const requestId = Number(req.params.id);
  if (!Number.isFinite(requestId) || requestId <= 0) {
    return res.status(400).json({ message: 'Invalid ride request ID.' });
  }

  try {
    const [result] = await db.query(
      `UPDATE ride_requests
         SET status = 'cancelled'
       WHERE request_id = ? AND commuter_id = ? AND status = 'waiting'`,
      [requestId, req.session.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Request not found or already accepted/cancelled.' });
    }
    res.json({ message: 'Ride request cancelled.' });
  } catch (err) {
    console.error('Cancel ride error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── GET /api/rides/nearby — driver sees waiting ride requests ──
router.get('/nearby', requireAuth, requireRole('driver'), async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.request_id,
              r.pickup_location,
              r.dropoff_location,
              r.fare_amount,
              r.request_time,
              r.pickup_lat,
              r.pickup_lng,
              u.full_name AS commuter_name
       FROM ride_requests r
       JOIN users u ON u.user_id = r.commuter_id
       WHERE r.status = 'waiting'
       ORDER BY r.request_time DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Nearby rides error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── POST /api/rides/:id/accept — driver accepts a ride (atomic) ──
router.post('/:id/accept', requireAuth, requireRole('driver'), async (req, res) => {
  const requestId = Number(req.params.id);
  if (!Number.isFinite(requestId) || requestId <= 0) {
    return res.status(400).json({ message: 'Invalid ride request ID.' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Look up the driver_id for this user
    const [drivers] = await conn.query(
      'SELECT driver_id FROM drivers WHERE user_id = ? LIMIT 1',
      [req.session.userId]
    );
    if (drivers.length === 0) {
      await conn.rollback();
      return res.status(403).json({ message: 'No driver profile found for your account.' });
    }
    const driverId = drivers[0].driver_id;

    // Lock the row and check it's still waiting
    const [rows] = await conn.query(
      'SELECT request_id, status FROM ride_requests WHERE request_id = ? FOR UPDATE',
      [requestId]
    );

    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Ride request not found.' });
    }

    if (rows[0].status !== 'waiting') {
      await conn.rollback();
      return res.status(409).json({ message: 'This ride has already been accepted or cancelled.' });
    }

    // Accept the ride
    await conn.query(
      `UPDATE ride_requests
         SET status = 'accepted', assigned_driver_id = ?
       WHERE request_id = ?`,
      [driverId, requestId]
    );

    await conn.commit();
    res.json({ message: 'Ride accepted successfully.', requestId });
  } catch (err) {
    await conn.rollback();
    console.error('Accept ride error:', err);
    res.status(500).json({ message: 'Server error.' });
  } finally {
    conn.release();
  }
});


// ── GET /api/rides/driver-profile — driver's tricycle info + today's stats ──
router.get('/driver-profile', requireAuth, requireRole('driver'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         t.body_number    AS bodyNumber,
         t.plate_number   AS plateNumber,
         t.toda_name      AS todaName,
         d.license_number AS licenseNumber,
         d.contact_number AS contactNumber,
         COUNT(CASE WHEN rr.status IN ('accepted','completed')
                    AND DATE(rr.request_time) = CURDATE() THEN 1 END)  AS todayTrips,
         COALESCE(SUM(CASE WHEN rr.status = 'completed'
                           AND DATE(rr.request_time) = CURDATE()
                           THEN rr.fare_amount ELSE 0 END), 0)         AS todayEarnings
       FROM drivers d
       LEFT JOIN tricycles t ON t.driver_id = d.driver_id
       LEFT JOIN ride_requests rr ON rr.assigned_driver_id = d.driver_id
       WHERE d.user_id = ?
       GROUP BY t.body_number, t.plate_number, t.toda_name,
                d.license_number, d.contact_number
       LIMIT 1`,
      [req.session.userId]
    );

    if (!rows.length) {
      return res.json({ bodyNumber: null, plateNumber: null, todayTrips: 0, todayEarnings: 0 });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Driver profile error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
