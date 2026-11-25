const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { emitToPlan, emitToUser } = require('../socket');

const router = express.Router();

// GET /api/savings
router.get('/savings', requireAuth, async (req, res, next) => {
  try {
    const plans = await db.listSavingsPlansForUser(req.user.id);
    return res.json(plans);
  } catch (err) {
    return next(err);
  }
});

// POST /api/savings
router.post('/savings', requireAuth, async (req, res, next) => {
  try {
    const { title, description, targetAmount, type, deadline, frequency } = req.body || {};
    const result = await db.createSavingsPlan({
      creatorId: req.user.id,
      title,
      description,
      targetAmount,
      type,
      deadline,
      frequency
    });

    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
});

// POST /api/savings/join
router.post('/savings/join', requireAuth, async (req, res, next) => {
  try {
    const { inviteCode } = req.body || {};
    const result = await db.joinGroupPlanByInviteCode({
      userId: req.user.id,
      inviteCode
    });

    if (result.alertMessage) {
      emitToPlan(result.plan.id, 'chat:message', result.alertMessage);
      emitToPlan(result.plan.id, 'savings:member_joined', {
        planId: result.plan.id,
        user: req.user
      });
    }

    return res.json({
      plan: result.plan,
      membership: result.membership
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/savings/:id
router.get('/savings/:id', requireAuth, async (req, res, next) => {
  try {
    const details = await db.getSavingsPlanDetails(req.params.id, req.user.id);
    return res.json(details);
  } catch (err) {
    return next(err);
  }
});

// POST /api/savings/:id/contribute
router.post('/savings/:id/contribute', requireAuth, async (req, res, next) => {
  try {
    const { amount } = req.body || {};
    const result = await db.contributeToSavingsPlan({
      planId: req.params.id,
      userId: req.user.id,
      amount
    });

    if (result.alertMessage) {
      emitToPlan(req.params.id, 'chat:message', result.alertMessage);
    }
    emitToPlan(req.params.id, 'savings:updated', {
      plan: result.plan,
      contribution: result.contribution,
      contributor: req.user
    });
    emitToUser(req.user.id, 'wallet:updated', {
      balance: result.walletBalance,
      currency: 'NGN'
    });

    return res.json({
      plan: result.plan,
      walletBalance: result.walletBalance,
      contribution: result.contribution
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
