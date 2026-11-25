const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { emitToPlan } = require('../socket');

const router = express.Router();

// GET /api/savings/:id/messages
router.get('/savings/:id/messages', requireAuth, async (req, res, next) => {
  try {
    const messages = await db.listGroupMessages(req.params.id, req.user.id, 100);
    return res.json({ messages });
  } catch (err) {
    return next(err);
  }
});

// POST /api/savings/:id/messages
router.post('/savings/:id/messages', requireAuth, async (req, res, next) => {
  try {
    const { content } = req.body || {};
    const message = await db.createGroupMessage({
      planId: req.params.id,
      senderId: req.user.id,
      content,
      type: 'CHAT'
    });

    emitToPlan(req.params.id, 'chat:message', message);

    return res.status(201).json({ message });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
