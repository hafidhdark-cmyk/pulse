const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { emitToUser } = require('../socket');

const router = express.Router();

async function verifyPaystackReference(reference, expectedAmount) {
  const secretKey = (process.env.PAYSTACK_SECRET_KEY || '').trim();
  if (!secretKey) {
    // Test-mode simulation when PAYSTACK_SECRET_KEY is not configured
    return {
      verified: true,
      simulated: true,
      reference: reference || `PSK-TEST-${Date.now()}`
    };
  }

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    }
  );
  const data = await response.json();
  if (!response.ok || !data?.status || data?.data?.status !== 'success') {
    const err = new Error(data?.message || 'Paystack payment verification failed');
    err.status = 400;
    throw err;
  }

  const paidNaira = Number(data.data.amount) / 100;
  if (expectedAmount && paidNaira < Number(expectedAmount)) {
    const err = new Error('Verified Paystack amount is less than requested amount');
    err.status = 400;
    throw err;
  }

  return {
    verified: true,
    simulated: false,
    reference: data.data.reference,
    amount: paidNaira
  };
}

// GET /api/wallet
router.get('/wallet', requireAuth, async (req, res, next) => {
  try {
    const [wallet, totalSaved, transactions] = await Promise.all([
      db.getWalletByUserId(req.user.id),
      db.getTotalSavedByUserId(req.user.id),
      db.listTransactionsByUserId(req.user.id, 50)
    ]);

    return res.json({
      balance: wallet ? wallet.balance : 0,
      totalSaved,
      currency: wallet ? wallet.currency : 'NGN',
      wallet,
      transactions
    });
  } catch (err) {
    return next(err);
  }
});

// POST /api/wallet/fund
router.post('/wallet/fund', requireAuth, async (req, res, next) => {
  try {
    const { amount, method = 'demo', reference } = req.body || {};
    const normalizedMethod = String(method || 'demo').toLowerCase();

    if (!['demo', 'paystack'].includes(normalizedMethod)) {
      return res.status(400).json({
        error: 'Invalid funding method. Supported methods: "demo" or "paystack".'
      });
    }

    let finalRef = reference;
    if (normalizedMethod === 'paystack') {
      const verification = await verifyPaystackReference(reference, amount);
      finalRef = verification.reference;
    }

    const result = await db.fundWallet({
      userId: req.user.id,
      amount,
      method: normalizedMethod,
      reference: finalRef
    });

    emitToUser(req.user.id, 'wallet:updated', {
      balance: result.wallet.balance,
      currency: result.wallet.currency,
      transaction: result.transaction
    });

    return res.json({
      message: `Wallet successfully funded with ₦${Number(result.transaction.amount).toLocaleString('en-NG')}`,
      wallet: result.wallet,
      transaction: result.transaction
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
