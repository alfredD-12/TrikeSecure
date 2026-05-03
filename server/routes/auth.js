const express = require('express');
const router = express.Router();
const db = require('../db');
const config = require('../config');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const { serializeUser, setSessionUser } = require('../auth/sessionAuth');

const BCRYPT_ROUNDS = config.security.bcryptSaltRounds;
const ENABLE_AUTH_RATE_LIMIT = false;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please try again later.' },
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateUsername(username) {
  return typeof username === 'string' && username.length >= 3 && username.length <= 30;
}

function validateEmail(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email);
}

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return false;
  }
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  return hasUppercase && hasNumber && hasSymbol;
}

function validateFullName(fullName) {
  return typeof fullName === 'string' && fullName.length >= 2 && fullName.length <= 100;
}

function isLikelyBcryptHash(value) {
  return typeof value === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
}

if (ENABLE_AUTH_RATE_LIMIT) {
  router.use(authLimiter);
}

// Register
router.post('/register', async (req, res) => {
  const fullName = typeof req.body.fullName === 'string' ? req.body.fullName.trim() : '';
  const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body.password;
  // Only allow self-registration as commuter or driver (not admin/officer)
  const allowedRoles = ['commuter', 'driver'];
  const role = allowedRoles.includes(req.body.role) ? req.body.role : 'commuter';

  if (!validateFullName(fullName) || !validateUsername(username) || !validateEmail(email) || !validatePassword(password)) {
    return res.status(400).json({
      message: 'Invalid registration data. Use a valid email and a strong password.',
    });
  }

  try {
    const [existing] = await db.query('SELECT user_id FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email or username already in use.' });
    }

    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await db.query(
      `INSERT INTO users (full_name, username, email, password, role)
       VALUES (?, ?, ?, ?, ?)`,
      [fullName, username, email, hash, role],
    );

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body.password;

  if (!validateEmail(email) || typeof password !== 'string' || password.length === 0)
    return res.status(400).json({ message: 'Email and password are required.' });

  try {
    const [rows] = await db.query(
      'SELECT user_id, username, full_name, email, password, role, status FROM users WHERE email = ? LIMIT 1',
      [email],
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = rows[0];

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'This account is not active.' });
    }

    if (!isLikelyBcryptHash(user.password)) {
      console.warn(`Skipping login for user_id=${user.user_id}: stored password is not a valid bcrypt hash.`);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    let match;
    try {
      match = await bcrypt.compare(password, user.password);
    } catch (compareError) {
      if (compareError && /invalid salt|invalid hash/i.test(compareError.message || '')) {
        console.warn(`Password compare failed for user_id=${user.user_id}: ${compareError.message}`);
        return res.status(401).json({ message: 'Invalid credentials.' });
      }
      throw compareError;
    }

    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    req.session.regenerate((sessionError) => {
      if (sessionError) {
        console.error(sessionError);
        return res.status(500).json({ message: 'Server error.' });
      }

      const sessionUser = setSessionUser(req, user);

      req.session.save((saveError) => {
        if (saveError) {
          console.error(saveError);
          return res.status(500).json({ message: 'Server error.' });
        }

        return res.json({
          message: 'Login successful.',
          ...sessionUser,
        });
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed.' });
    res.clearCookie('sid');
    res.json({ message: 'Logged out.' });
  });
});

// Get current session user
router.get('/me', (req, res) => {
  if (!req.session.userId || (!req.session.accountRole && !req.session.role)) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  res.json(serializeUser({
    user_id: req.session.userId,
    username: req.session.username,
    full_name: req.session.fullName,
    email: req.session.email,
    role: req.session.accountRole || req.session.role,
    status: req.session.status || 'active',
  }));
});

module.exports = router;
