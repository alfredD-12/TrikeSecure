const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../auth/sessionAuth');

// Get the latest active fare settings
router.get('/latest', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM fare_settings ORDER BY effective_date DESC LIMIT 1'
    );
    if (rows.length === 0) {
      return res.json({
        base_fare: 20.00,
        base_distance_km: 3.00,
        per_km_rate: 0.50
      });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching fare:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin ONLY: update the fare settings
router.post('/update', requireAuth, async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { base_fare, base_distance_km, per_km_rate } = req.body;
  if (!base_fare || !base_distance_km || !per_km_rate) {
    return res.status(400).json({ error: 'Missing fare parameters' });
  }

  try {
    await db.query(
      `INSERT INTO fare_settings (base_fare, base_distance_km, per_km_rate, set_by_admin_id)
       VALUES (?, ?, ?, ?)`,
      [base_fare, base_distance_km, per_km_rate, req.session.user.user_id]
    );
    res.json({ success: true, message: 'Fare settings updated.' });
  } catch (error) {
    console.error('Error updating fare:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;