const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications
router.get('/notifications', requireAuth, async (req, res, next) => {
  try {
    const result = await db.listNotifications(req.user.id);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

// PATCH /api/notifications/read-all
router.patch('/notifications/read-all', requireAuth, async (req, res, next) => {
  try {
    const result = await db.markAllNotificationsRead(req.user.id);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
