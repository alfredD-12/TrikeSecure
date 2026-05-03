const express = require('express');
const router = express.Router();
const db = require('../db');
const { getAccountRole, requireAuth, requireRole } = require('../auth/sessionAuth');
const {
  getDriverAccessContext,
  getDriverAccessMessage,
  getDriverDashboardState,
} = require('../services/driverState');

const ACTIVE_RIDE_STATUSES = ['waiting', 'accepted', 'arrived', 'in_progress'];
const ACTIVE_RIDE_STATUS_PLACEHOLDERS = ACTIVE_RIDE_STATUSES.map(() => '?').join(', ');
const DRIVER_LOCATION_ACTIVE_STATUSES = ['accepted', 'arrived', 'in_progress'];
const driverLocations = new Map();

function parsePositiveInt(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizeNullableNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function roundCoordinate(value, decimals = 3) {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  const factor = 10 ** decimals;
  return Math.round(parsed * factor) / factor;
}

function isValidCoordinate(lat, lng) {
  return Number.isFinite(lat)
    && Number.isFinite(lng)
    && lat >= -90
    && lat <= 90
    && lng >= -180
    && lng <= 180;
}

function getFreshDriverLocation(driverId) {
  const location = driverLocations.get(driverId);
  if (!location) {
    return null;
  }

  if (Date.now() - location.updatedAtMs > 2 * 60 * 1000) {
    driverLocations.delete(driverId);
    return null;
  }

  return {
    lat: location.lat,
    lng: location.lng,
    accuracy: location.accuracy,
    updatedAt: location.updatedAt,
  };
}

function attachRuntimeRideDetails(ride) {
  if (!ride || !ride.assignedDriverId || !DRIVER_LOCATION_ACTIVE_STATUSES.includes(ride.status)) {
    return ride;
  }

  return {
    ...ride,
    driverLocation: getFreshDriverLocation(ride.assignedDriverId),
  };
}

function serializeRide(row) {
  if (!row) {
    return null;
  }

  return {
    requestId: row.requestId,
    commuterId: row.commuterId,
    pickupLocation: row.pickupLocation,
    dropoffLocation: row.dropoffLocation,
    pickupLat: row.pickupLat == null ? null : Number(row.pickupLat),
    pickupLng: row.pickupLng == null ? null : Number(row.pickupLng),
    dropoffLat: row.dropoffLat == null ? null : Number(row.dropoffLat),
    dropoffLng: row.dropoffLng == null ? null : Number(row.dropoffLng),
    fareAmount: row.fareAmount == null ? null : Number(row.fareAmount),
    requestTime: row.requestTime,
    acceptedAt: row.acceptedAt,
    arrivedAt: row.arrivedAt,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    cancelledAt: row.cancelledAt,
    assignedDriverId: row.assignedDriverId,
    status: row.status,
    commuter: {
      fullName: row.commuterName,
      email: row.commuterEmail,
    },
    driver: row.assignedDriverId
      ? {
          id: row.assignedDriverId,
          fullName: row.driverName,
          email: row.driverEmail,
          contactNumber: row.driverContactNumber,
          licenseNumber: row.driverLicenseNumber,
          todaName: row.todaName,
        }
      : null,
    tricycle: row.tricycleId
      ? {
          id: row.tricycleId,
          bodyNumber: row.bodyNumber,
          plateNumber: row.plateNumber,
          makeModel: row.makeModel,
          color: row.color,
        }
      : null,
  };
}

async function getRideDetails(executor, requestId) {
  const [rows] = await executor.query(
    `
      SELECT
        r.request_id AS requestId,
        r.commuter_id AS commuterId,
        r.pickup_location AS pickupLocation,
        r.dropoff_location AS dropoffLocation,
        r.pickup_lat AS pickupLat,
        r.pickup_lng AS pickupLng,
        r.dropoff_lat AS dropoffLat,
        r.dropoff_lng AS dropoffLng,
        r.fare_amount AS fareAmount,
        r.request_time AS requestTime,
        r.accepted_at AS acceptedAt,
        r.arrived_at AS arrivedAt,
        r.started_at AS startedAt,
        r.completed_at AS completedAt,
        r.cancelled_at AS cancelledAt,
        r.assigned_driver_id AS assignedDriverId,
        r.status,
        commuter.full_name AS commuterName,
        commuter.email AS commuterEmail,
        driver_user.full_name AS driverName,
        driver_user.email AS driverEmail,
        d.contact_number AS driverContactNumber,
        d.license_number AS driverLicenseNumber,
        td.toda_name AS todaName,
        t.tricycle_id AS tricycleId,
        t.body_number AS bodyNumber,
        t.plate_number AS plateNumber,
        t.make_model AS makeModel,
        t.color
      FROM ride_requests r
      INNER JOIN users commuter ON commuter.user_id = r.commuter_id
      LEFT JOIN drivers d ON d.driver_id = r.assigned_driver_id
      LEFT JOIN users driver_user ON driver_user.user_id = d.user_id
      LEFT JOIN todas td ON td.toda_id = d.toda_id
      LEFT JOIN tricycles t ON t.driver_id = d.driver_id AND t.status = 'approved'
      WHERE r.request_id = ?
      LIMIT 1
    `,
    [requestId],
  );

  return attachRuntimeRideDetails(serializeRide(rows[0] || null));
}

function requireRideOwner(ride, req, driverContext = null) {
  const role = getAccountRole(req);

  if (role === 'commuter') {
    return ride.commuterId === req.session.userId;
  }

  if (role === 'driver') {
    return Boolean(driverContext?.driverId && ride.assignedDriverId === driverContext.driverId);
  }

  return false;
}

async function transitionAssignedDriverRide(req, res, options) {
  const { fromStatus, toStatus, timestampColumn, successMessage } = options;
  const requestId = parsePositiveInt(req.params.id);

  if (!requestId) {
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
      `
        SELECT request_id, assigned_driver_id, status
        FROM ride_requests
        WHERE request_id = ?
        FOR UPDATE
      `,
      [requestId],
    );

    if (rows.length === 0 || rows[0].assigned_driver_id !== driverContext.driverId) {
      await conn.rollback();
      return res.status(404).json({ message: 'Ride request not found.' });
    }

    if (rows[0].status !== fromStatus) {
      await conn.rollback();
      return res.status(409).json({ message: `This ride must be ${fromStatus.replace('_', ' ')} before it can move to ${toStatus.replace('_', ' ')}.` });
    }

    await conn.query(
      `
        UPDATE ride_requests
        SET status = ?, ${timestampColumn} = CURRENT_TIMESTAMP
        WHERE request_id = ?
      `,
      [toStatus, requestId],
    );

    if (toStatus === 'completed') {
      driverLocations.delete(driverContext.driverId);
    }

    const ride = await getRideDetails(conn, requestId);

    await conn.commit();
    return res.json({
      message: successMessage,
      requestId,
      status: toStatus,
      ride,
    });
  } catch (error) {
    await conn.rollback();
    console.error(`Ride ${toStatus} transition error:`, error);
    return res.status(500).json({ message: 'Server error.' });
  } finally {
    conn.release();
  }
}

// POST /api/rides/request - commuter creates a ride request
router.post('/request', requireAuth, requireRole('commuter'), async (req, res) => {
  const pickup = typeof req.body.pickup === 'string' ? req.body.pickup.trim() : '';
  const dropoff = typeof req.body.dropoff === 'string' ? req.body.dropoff.trim() : '';
  const pickupLat = normalizeNullableNumber(req.body.pickupLat);
  const pickupLng = normalizeNullableNumber(req.body.pickupLng);
  const dropoffLat = normalizeNullableNumber(req.body.dropoffLat);
  const dropoffLng = normalizeNullableNumber(req.body.dropoffLng);

  if (!pickup) {
    return res.status(400).json({ message: 'Pickup location is required.' });
  }

  try {
    const [activeRows] = await db.query(
      `
        SELECT request_id
        FROM ride_requests
        WHERE commuter_id = ? AND status IN (${ACTIVE_RIDE_STATUS_PLACEHOLDERS})
        ORDER BY request_time DESC
        LIMIT 1
      `,
      [req.session.userId, ...ACTIVE_RIDE_STATUSES],
    );

    if (activeRows.length > 0) {
      const activeRide = await getRideDetails(db, activeRows[0].request_id);
      return res.status(409).json({
        message: 'You already have an active ride request.',
        ride: activeRide,
      });
    }

    const [result] = await db.query(
      `
        INSERT INTO ride_requests (
          commuter_id,
          pickup_location,
          dropoff_location,
          pickup_lat,
          pickup_lng,
          dropoff_lat,
          dropoff_lng,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 'waiting')
      `,
      [req.session.userId, pickup, dropoff || '', pickupLat, pickupLng, dropoffLat, dropoffLng],
    );

    const ride = await getRideDetails(db, result.insertId);

    return res.status(201).json({
      requestId: result.insertId,
      status: 'waiting',
      ride,
      message: 'Ride request created.',
    });
  } catch (error) {
    console.error('Ride request error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/rides/active - current waiting/accepted ride for this account
router.get('/active', requireAuth, async (req, res) => {
  const role = getAccountRole(req);

  try {
    if (role === 'commuter') {
      const [rows] = await db.query(
        `
          SELECT request_id
          FROM ride_requests
          WHERE commuter_id = ? AND status IN (${ACTIVE_RIDE_STATUS_PLACEHOLDERS})
          ORDER BY request_time DESC
          LIMIT 1
        `,
        [req.session.userId, ...ACTIVE_RIDE_STATUSES],
      );

      const ride = rows.length > 0 ? await getRideDetails(db, rows[0].request_id) : null;
      return res.json({ ride });
    }

    if (role === 'driver') {
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
          SELECT request_id
          FROM ride_requests
          WHERE assigned_driver_id = ? AND status IN ('accepted', 'arrived', 'in_progress')
          ORDER BY request_time DESC
          LIMIT 1
        `,
        [driverContext.driverId],
      );

      const ride = rows.length > 0 ? await getRideDetails(db, rows[0].request_id) : null;
      return res.json({ ride });
    }

    return res.status(403).json({ message: 'Only commuters and drivers can view active rides.' });
  } catch (error) {
    console.error('Active ride lookup error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/rides/:id/status - ride status for the commuter or assigned driver
router.get('/:id/status', requireAuth, async (req, res) => {
  const requestId = parsePositiveInt(req.params.id);

  if (!requestId) {
    return res.status(400).json({ message: 'Invalid ride request ID.' });
  }

  try {
    const ride = await getRideDetails(db, requestId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride request not found.' });
    }

    const role = getAccountRole(req);
    const driverContext = role === 'driver'
      ? await getDriverAccessContext(db, req.session.userId)
      : null;

    if (!requireRideOwner(ride, req, driverContext)) {
      return res.status(404).json({ message: 'Ride request not found.' });
    }

    return res.json({ ride });
  } catch (error) {
    console.error('Ride status error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/rides/:id/driver-location - assigned driver shares live location during an active ride
router.post('/:id/driver-location', requireAuth, requireRole('driver'), async (req, res) => {
  const requestId = parsePositiveInt(req.params.id);
  const lat = normalizeNullableNumber(req.body.lat);
  const lng = normalizeNullableNumber(req.body.lng);
  const accuracy = normalizeNullableNumber(req.body.accuracy);

  if (!requestId) {
    return res.status(400).json({ message: 'Invalid ride request ID.' });
  }

  if (!isValidCoordinate(lat, lng)) {
    return res.status(400).json({ message: 'A valid driver location is required.' });
  }

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
        SELECT request_id, assigned_driver_id, status
        FROM ride_requests
        WHERE request_id = ? AND assigned_driver_id = ?
        LIMIT 1
      `,
      [requestId, driverContext.driverId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Ride request not found.' });
    }

    if (!DRIVER_LOCATION_ACTIVE_STATUSES.includes(rows[0].status)) {
      driverLocations.delete(driverContext.driverId);
      return res.status(409).json({ message: 'Driver location can only be shared during an active ride.' });
    }

    const updatedAt = new Date().toISOString();
    driverLocations.set(driverContext.driverId, {
      lat,
      lng,
      accuracy,
      updatedAt,
      updatedAtMs: Date.now(),
    });

    return res.json({
      message: 'Driver location updated.',
      driverLocation: getFreshDriverLocation(driverContext.driverId),
    });
  } catch (error) {
    console.error('Driver ride location update error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/rides/:id/cancel - commuter cancels their own waiting request
router.post('/:id/cancel', requireAuth, requireRole('commuter'), async (req, res) => {
  const requestId = parsePositiveInt(req.params.id);

  if (!requestId) {
    return res.status(400).json({ message: 'Invalid ride request ID.' });
  }

  try {
    const [result] = await db.query(
      `
        UPDATE ride_requests
        SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP
        WHERE request_id = ? AND commuter_id = ? AND status = 'waiting'
      `,
      [requestId, req.session.userId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Request not found or already accepted/cancelled.' });
    }

    return res.json({ message: 'Ride request cancelled.', requestId, status: 'cancelled' });
  } catch (error) {
    console.error('Cancel ride error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/rides/nearby - approved driver sees waiting ride requests
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

    return res.json(rows.map((row) => ({
      ...row,
      pickup_lat: roundCoordinate(row.pickup_lat),
      pickup_lng: roundCoordinate(row.pickup_lng),
      pickup_precision: 'approximate',
    })));
  } catch (error) {
    console.error('Nearby rides error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/rides/:id/accept - approved driver accepts a ride
router.post('/:id/accept', requireAuth, requireRole('driver'), async (req, res) => {
  const requestId = parsePositiveInt(req.params.id);

  if (!requestId) {
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

    const [activeRows] = await conn.query(
      `
        SELECT request_id
        FROM ride_requests
        WHERE assigned_driver_id = ? AND status IN ('accepted', 'arrived', 'in_progress') AND request_id <> ?
        LIMIT 1
        FOR UPDATE
      `,
      [driverContext.driverId, requestId],
    );

    if (activeRows.length > 0) {
      await conn.rollback();
      return res.status(409).json({ message: 'Complete your current accepted ride before accepting another booking.' });
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
        SET status = 'accepted', assigned_driver_id = ?, accepted_at = CURRENT_TIMESTAMP
        WHERE request_id = ?
      `,
      [driverContext.driverId, requestId],
    );

    const ride = await getRideDetails(conn, requestId);

    await conn.commit();
    return res.json({
      message: 'Ride accepted successfully.',
      requestId,
      status: 'accepted',
      ride,
    });
  } catch (error) {
    await conn.rollback();
    console.error('Accept ride error:', error);
    return res.status(500).json({ message: 'Server error.' });
  } finally {
    conn.release();
  }
});

// POST /api/rides/:id/arrive - assigned driver marks arrival at pickup
router.post('/:id/arrive', requireAuth, requireRole('driver'), async (req, res) => (
  transitionAssignedDriverRide(req, res, {
    fromStatus: 'accepted',
    toStatus: 'arrived',
    timestampColumn: 'arrived_at',
    successMessage: 'Driver arrival marked successfully.',
  })
));

// POST /api/rides/:id/start - assigned driver starts the ride
router.post('/:id/start', requireAuth, requireRole('driver'), async (req, res) => (
  transitionAssignedDriverRide(req, res, {
    fromStatus: 'arrived',
    toStatus: 'in_progress',
    timestampColumn: 'started_at',
    successMessage: 'Ride started successfully.',
  })
));

// POST /api/rides/:id/complete - assigned driver completes an in-progress ride
router.post('/:id/complete', requireAuth, requireRole('driver'), async (req, res) => (
  transitionAssignedDriverRide(req, res, {
    fromStatus: 'in_progress',
    toStatus: 'completed',
    timestampColumn: 'completed_at',
    successMessage: 'Ride completed successfully.',
  })
));

// GET /api/rides/driver-profile - driver profile, onboarding state, and today's stats
router.get('/driver-profile', requireAuth, requireRole('driver'), async (req, res) => {
  try {
    const driverState = await getDriverDashboardState(db, req.session.userId);

    const [[stats]] = await db.query(
      `
        SELECT
          COUNT(CASE
            WHEN status IN ('accepted', 'arrived', 'in_progress', 'completed') AND DATE(request_time) = CURDATE() THEN 1
          END) AS todayTrips,
          COALESCE(SUM(CASE
            WHEN status = 'completed' AND DATE(COALESCE(completed_at, request_time)) = CURDATE() THEN fare_amount
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

router.get('/history', requireAuth, async (req, res) => {
  const userId = req.session?.userId;
  const { limit = 20, offset = 0 } = req.query;

  try {
    const [rows] = await db.query(
      `
        SELECT
          r.request_id,
          r.pickup_location,
          r.dropoff_location,
          r.fare_amount,
          r.request_time,
          r.assigned_driver_id,
          r.status,
          d.driver_id,
          d.license_number,
          u.full_name AS driver_name,
          t.plate_number,
          t.body_number
        FROM ride_requests r
        LEFT JOIN drivers d ON d.driver_id = r.assigned_driver_id
        LEFT JOIN users u ON u.user_id = d.user_id
        LEFT JOIN tricycles t ON t.driver_id = d.driver_id
        WHERE r.commuter_id = ?
        ORDER BY r.request_time DESC
        LIMIT ? OFFSET ?
      `,
      [userId, Number(limit) || 20, Number(offset) || 0]
    );

    const rides = rows.map((row) => ({
      id: row.request_id,
      pickupLocation: row.pickup_location,
      dropoffLocation: row.dropoff_location,
      fareAmount: row.fare_amount,
      requestTime: row.request_time,
      status: row.status,
      driver: {
        id: row.driver_id,
        name: row.driver_name,
        licenseNumber: row.license_number,
        plateNumber: row.plate_number,
        bodyNumber: row.body_number,
      },
    }));

    res.json({ rides });
  } catch (error) {
    console.error('Ride history error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
