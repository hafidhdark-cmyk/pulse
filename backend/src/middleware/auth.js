const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'pulse-nobus-hackathon-super-secret-key-2026';

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Provide Bearer token.' });
    }

    const token = authHeader.slice(7).trim();
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await db.findUserById(payload.id);

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired user session.' });
    }

    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = {
  JWT_SECRET,
  signToken,
  requireAuth
};
