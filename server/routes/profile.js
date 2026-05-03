const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const { requireAuth } = require('../auth/sessionAuth');

router.get('/me', requireAuth, async (req, res) => {
  const userId = req.session?.userId;
  
  if (!userId) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  try {
    const [rows] = await db.query(
      `SELECT user_id, full_name, sex, weight, mobile_number, username, email, role, status, created_at FROM users WHERE user_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = rows[0];
    res.json({
      user: {
        userId: user.user_id,
        fullName: user.full_name,
        sex: user.sex,
        weight: user.weight,
        mobileNumber: user.mobile_number,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.created_at,
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.put('/', requireAuth, async (req, res) => {
  const userId = req.session?.userId;
  const { fullName, email, sex, weight, mobileNumber } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ message: 'Full name and email are required.' });
  }

  try {
    await db.query(
      `UPDATE users SET full_name = ?, email = ?, sex = ?, weight = ?, mobile_number = ? WHERE user_id = ?`,
      [fullName, email, sex || null, weight || null, mobileNumber || null, userId]
    );

    res.json({ message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.put('/password', requireAuth, async (req, res) => {
  const userId = req.session?.userId;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.query(
      `UPDATE users SET password = ? WHERE user_id = ?`,
      [hashedPassword, userId]
    );

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;