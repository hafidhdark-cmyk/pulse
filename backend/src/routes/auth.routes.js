const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { signToken, requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/auth/register', async (req, res, next) => {
  try {
    const { name, email, username, password } = req.body || {};
    if (!name || !email || !username || !password) {
      return res.status(400).json({
        error: 'name, email, username, and password are required'
      });
    }
    if (String(password).length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const { user, wallet } = await db.createUserWithWallet({
      name,
      email,
      username,
      passwordHash
    });

    const token = signToken(user);
    return res.status(201).json({
      token,
      user,
      wallet
    });
  } catch (err) {
    return next(err);
  }
});

// POST /api/auth/login
router.post('/auth/login', async (req, res, next) => {
  try {
    const { emailOrUsername, email, username, password } = req.body || {};
    const identifier = emailOrUsername || email || username;
    if (!identifier || !password) {
      return res.status(400).json({
        error: 'emailOrUsername and password are required'
      });
    }

    const userWithHash = await db.findUserByEmailOrUsername(identifier);
    if (!userWithHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(String(password), userWithHash.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { passwordHash, ...user } = userWithHash;
    const wallet = await db.getWalletByUserId(user.id);
    const token = signToken(user);

    return res.json({
      token,
      user,
      wallet
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/auth/me
router.get('/auth/me', requireAuth, async (req, res, next) => {
  try {
    const wallet = await db.getWalletByUserId(req.user.id);
    const { unreadCount } = await db.listNotifications(req.user.id);
    return res.json({
      user: req.user,
      wallet,
      unreadNotifications: unreadCount
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/users/lookup?q=<username>
router.get('/users/lookup', requireAuth, async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const matches = await db.searchUsers(q, req.user.id);
    const exactMatch =
      matches.find(
        (u) =>
          u.username.toLowerCase() === q.replace(/^@/, '').toLowerCase() ||
          u.email.toLowerCase() === q.toLowerCase()
      ) || matches[0] || null;

    if (!exactMatch) {
      return res.status(404).json({ error: `No Pulse user found matching "${q}"` });
    }

    return res.json({
      user: exactMatch,
      users: matches
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
