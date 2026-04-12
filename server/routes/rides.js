const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth, requireRole } = require('../auth/sessionAuth');
const {
  getDriverAccessContext,
  getDriverAccessMessage,
  getDriverDashboardState,
} = require('../services/driverState');

// POST /api/rides/request — commuter creates a ride request
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
      `
        INSERT INTO ride_requests (commuter_id, pickup_location, dropoff_location, pickup_lat, pickup_lng, status)
        VALUES (?, ?, ?, ?, ?, 'waiting')
      `,
      [req.session.userId, pickup, dropoff || '', pickupLat, pickupLng],
    );

    return res.status(201).json({
      requestId: result.insertId,
      status: 'waiting',
      message: 'Ride request created.',
    });
  } catch (error) {
    console.error('Ride request error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/rides/:id/cancel — commuter cancels their own waiting request
router.post('/:id/cancel', requireAuth, requireRole('commuter'), async (req, res) => {
  const requestId = Number(req.params.id);

  if (!Number.isFinite(requestId) || requestId <= 0) {
    return res.status(400).json({ message: 'Invalid ride request ID.' });
  }

  try {
    const [result] = await db.query(
      `
        UPDATE ride_requests
        SET status = 'cancelled'
        WHERE request_id = ? AND commuter_id = ? AND status = 'waiting'
      `,
      [requestId, req.session.userId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Request not found or already accepted/cancelled.' });
    }

    return res.json({ message: 'Ride request cancelled.' });
  } catch (error) {
    console.error('Cancel ride error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/rides/nearby — approved driver sees waiting ride requests
router.get('/nearby', requireAuth, requireRole('driver'), async (req, res) => {
  try {
    const driverContext = await getDriverAccessContext(db, req.session.userId);
    const accessMessage = getDriverAccessMessage(driverContext);

    if (accessMessage) {
      return res.status(403).json({
        message: accessMessage,
        onboardingState: driverContext || null,
      });
    }

    const [rows] = await db.query(
      `
        SELECT
          r.request_id,
          r.pickup_location,
          r.dropoff_location,
          r.fare_amount,
          r.request_time,
          r.pickup_lat,
          r.pickup_lng,
          commuter.full_name AS commuter_name
        FROM ride_requests r
        INNER JOIN users commuter ON commuter.user_id = r.commuter_id
        WHERE r.status = 'waiting'
        ORDER BY r.request_time DESC
      `,
    );

    return res.json(rows);
  } catch (error) {
    console.error('Nearby rides error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/rides/:id/accept — approved driver accepts a ride
router.post('/:id/accept', requireAuth, requireRole('driver'), async (req, res) => {
  const requestId = Number(req.params.id);

  if (!Number.isFinite(requestId) || requestId <= 0) {
    return res.status(400).json({ message: 'Invalid ride request ID.' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const driverContext = await getDriverAccessContext(conn, req.session.userId);
    const accessMessage = getDriverAccessMessage(driverContext);

    if (accessMessage) {
      await conn.rollback();
      return res.status(403).json({
        message: accessMessage,
        onboardingState: driverContext || null,
      });
    }

    const [rows] = await conn.query(
      'SELECT request_id, status FROM ride_requests WHERE request_id = ? FOR UPDATE',
      [requestId],
    );

    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Ride request not found.' });
    }

    if (rows[0].status !== 'waiting') {
      await conn.rollback();
      return res.status(409).json({ message: 'This ride has already been accepted or cancelled.' });
    }

    await conn.query(
      `
        UPDATE ride_requests
        SET status = 'accepted', assigned_driver_id = ?
        WHERE request_id = ?
      `,
      [driverContext.driverId, requestId],
    );

    await conn.commit();
    return res.json({ message: 'Ride accepted successfully.', requestId });
  } catch (error) {
    await conn.rollback();
    console.error('Accept ride error:', error);
    return res.status(500).json({ message: 'Server error.' });
  } finally {
    conn.release();
  }
});

// GET /api/rides/driver-profile — driver profile, onboarding state, and today's stats
router.get('/driver-profile', requireAuth, requireRole('driver'), async (req, res) => {
  try {
    const driverState = await getDriverDashboardState(db, req.session.userId);

    const [[stats]] = await db.query(
      `
        SELECT
          COUNT(CASE
            WHEN status IN ('accepted', 'completed') AND DATE(request_time) = CURDATE() THEN 1
          END) AS todayTrips,
          COALESCE(SUM(CASE
            WHEN status = 'completed' AND DATE(request_time) = CURDATE() THEN fare_amount
            ELSE 0
          END), 0) AS todayEarnings
        FROM ride_requests
        WHERE assigned_driver_id = ?
      `,
      [driverState.driverId || 0],
    );

    return res.json({
      ...driverState,
      todayTrips: Number(stats.todayTrips || 0),
      todayEarnings: Number(stats.todayEarnings || 0),
    });
  } catch (error) {
    console.error('Driver profile error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
