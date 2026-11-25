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
      message: 'Joined group savings plan',
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
      message: 'Contribution successful',
      plan: result.plan,
      walletBalance: result.walletBalance,
      contribution: result.contribution,
      transaction: result.transaction
    });
  } catch (err) {
    return next(err);
  }
});

// POST /api/savings/:id/withdraw
router.post('/savings/:id/withdraw', requireAuth, async (req, res, next) => {
  try {
    const { amount, reason } = req.body || {};
    const result = await db.requestOrExecuteWithdrawal({
      planId: req.params.id,
      userId: req.user.id,
      amount,
      reason
    });

    if (result.alertMessage) {
      emitToPlan(req.params.id, 'chat:message', result.alertMessage);
    }
    emitToPlan(req.params.id, 'savings:updated', {
      planId: req.params.id,
      mode: result.mode
    });

    if (result.mode === 'INSTANT') {
      emitToUser(req.user.id, 'wallet:updated', {
        balance: result.walletBalance,
        currency: 'NGN'
      });
    }

    return res.status(result.mode === 'APPROVAL_REQUIRED' ? 201 : 200).json(result);
  } catch (err) {
    return next(err);
  }
});

// POST /api/savings/:id/withdrawals/:withdrawalId/approve
router.post('/savings/:id/withdrawals/:withdrawalId/approve', requireAuth, async (req, res, next) => {
  try {
    const { action = 'APPROVE' } = req.body || {};
    const result = await db.voteWithdrawalRequest({
      planId: req.params.id,
      withdrawalId: req.params.withdrawalId,
      userId: req.user.id,
      action
    });

    if (result.alertMessage) {
      emitToPlan(req.params.id, 'chat:message', result.alertMessage);
    }
    emitToPlan(req.params.id, 'savings:updated', {
      planId: req.params.id,
      withdrawalRequest: result.withdrawalRequest,
      disbursed: result.disbursed
    });

    if (result.disbursed && result.withdrawalRequest?.requesterId) {
      emitToUser(result.withdrawalRequest.requesterId, 'wallet:updated', {
        currency: 'NGN'
      });
      emitToUser(result.withdrawalRequest.requesterId, 'notification:new', {
        title: 'Group Withdrawal Approved',
        message: `₦${Number(result.withdrawalRequest.amount).toLocaleString('en-NG')} has been credited to your wallet.`
      });
    }

    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
