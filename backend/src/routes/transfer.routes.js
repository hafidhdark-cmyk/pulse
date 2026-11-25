const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { emitToUser, emitToPlan } = require('../socket');

const router = express.Router();

// POST /api/transfers/p2p
router.post('/transfers/p2p', requireAuth, async (req, res, next) => {
  try {
    const { recipientUsername, amount, note } = req.body || {};
    const result = await db.executeP2PTransfer({
      senderId: req.user.id,
      recipientUsername,
      amount,
      note
    });

    emitToUser(req.user.id, 'wallet:updated', {
      balance: result.newBalance,
      currency: 'NGN'
    });
    emitToUser(result.recipient.id, 'notification:new', {
      notification: result.recipientNotification
    });
    emitToUser(result.recipient.id, 'p2p:received', {
      from: req.user,
      amount: result.transaction.amount,
      note
    });

    return res.json({
      message: 'Transfer successful',
      transaction: result.transaction,
      newBalance: result.newBalance,
      recipient: result.recipient
    });
  } catch (err) {
    return next(err);
  }
});

// POST /api/transfers/request
router.post('/transfers/request', requireAuth, async (req, res, next) => {
  try {
    const { amount, description, planId } = req.body || {};
    const result = await db.createPaymentRequest({
      creatorId: req.user.id,
      amount,
      description,
      planId
    });

    if (result.alertMessage && planId) {
      emitToPlan(planId, 'chat:message', result.alertMessage);
      emitToPlan(planId, 'transfer:request_created', result.paymentRequest);
    }

    return res.status(201).json({
      paymentRequest: result.paymentRequest
    });
  } catch (err) {
    return next(err);
  }
});

// POST /api/transfers/request/:id/pay
router.post('/transfers/request/:id/pay', requireAuth, async (req, res, next) => {
  try {
    const result = await db.payPaymentRequest({
      requestId: req.params.id,
      payerId: req.user.id
    });

    if (result.alertMessage && result.paymentRequest.planId) {
      emitToPlan(result.paymentRequest.planId, 'chat:message', result.alertMessage);
      emitToPlan(result.paymentRequest.planId, 'transfer:request_paid', result.paymentRequest);
    }

    emitToUser(req.user.id, 'wallet:updated', {
      balance: result.newBalance,
      currency: 'NGN'
    });
    emitToUser(result.creator.id, 'wallet:updated', {
      balance: result.creatorBalance,
      currency: 'NGN'
    });
    emitToUser(result.creator.id, 'notification:new', {
      notification: result.creatorNotification
    });

    return res.json({
      message: 'Payment request settled',
      paymentRequest: result.paymentRequest,
      transaction: result.transaction,
      newBalance: result.newBalance
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
