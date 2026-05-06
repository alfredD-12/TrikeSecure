const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../auth/sessionAuth');

// Submit a ride rating
router.post('/', requireAuth, async (req, res) => {
  // Only commuters can rate
  if (req.session.accountRole !== 'commuter') {
    return res.status(403).json({ error: 'Only commuters can submit ratings' });
  }

  const { request_id, rating_value, feedback } = req.body;
  if (!request_id || !rating_value || rating_value < 1 || rating_value > 5) {
    return res.status(400).json({ error: 'Invalid rating parameters' });
  }

  const commuter_id = req.session.userId;

  try {
    // 1. Verify the request exists, belongs to the commuter, is completed, and get the driver_id
    const [ride] = await db.query(
      `SELECT r.request_id, r.status, d.driver_id 
       FROM ride_requests r 
       JOIN drivers d ON r.assigned_driver_id = d.driver_id
       WHERE r.request_id = ? AND r.commuter_id = ?`,
      [request_id, commuter_id]
    );

    if (ride.length === 0) {
      return res.status(404).json({ error: 'Ride request not found or not yours' });
    }
    if (ride[0].status !== 'completed') {
      return res.status(400).json({ error: 'Can only rate completed rides' });
    }

    const driver_id = ride[0].driver_id;

    // Verify driver exists before inserting
    if (!driver_id) {
      return res.status(400).json({ error: 'No driver assigned to this ride' });
    }

    // 2. Insert rating
    console.log('Inserting rating:', { request_id, driver_id, commuter_id, rating_value, feedback });
    await db.query(
      `INSERT INTO ride_ratings (request_id, driver_id, commuter_id, rating_value, feedback)
       VALUES (?, ?, ?, ?, ?)`,
      [request_id, driver_id, commuter_id, rating_value, feedback || null]
    );
    console.log('Rating inserted successfully');

    res.json({ success: true, message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Error submitting rating:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    // Handle duplicate rating attempt (UNIQUE constraint on request_id)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'You have already rated this ride' });
    }
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Optional: get average rating for a driver
router.get('/driver/:id', requireAuth, async (req, res) => {
  try {
    const [stats] = await db.query(
      `SELECT AVG(rating_value) as average_rating, COUNT(rating_id) as total_ratings
       FROM ride_ratings WHERE driver_id = ?`,
      [req.params.id]
    );
    res.json(stats[0] || { average_rating: null, total_ratings: 0 });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all ratings (Admin only)
router.get('/all', requireAuth, async (req, res) => {
  if (req.session.accountRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  try {
    const [ratings] = await db.query(
      `SELECT rr.rating_id, rr.rating_value, rr.feedback, rr.created_at,
              u_commuter.full_name AS commuter_name,
              u_driver.full_name AS driver_name,
              t.body_number
       FROM ride_ratings rr
       JOIN users u_commuter ON rr.commuter_id = u_commuter.user_id
       JOIN drivers d ON rr.driver_id = d.driver_id
       JOIN users u_driver ON d.user_id = u_driver.user_id
       LEFT JOIN tricycles t ON d.driver_id = t.driver_id
       ORDER BY rr.created_at DESC`
    );
    res.json(ratings);
  } catch (error) {
    console.error('Error fetching all ratings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;