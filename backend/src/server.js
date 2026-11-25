require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const db = require('./db');
const { initSocket } = require('./socket');

const authRoutes = require('./routes/auth.routes');
const walletRoutes = require('./routes/wallet.routes');
const savingsRoutes = require('./routes/savings.routes');
const chatRoutes = require('./routes/chat.routes');
const transferRoutes = require('./routes/transfer.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  })
);
app.use(express.json());

// Health & Nobus status endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'pulse-backend',
    currency: 'NGN',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes under /api
app.use('/api', authRoutes);
app.use('/api', walletRoutes);
app.use('/api', savingsRoutes);
app.use('/api', chatRoutes);
app.use('/api', transferRoutes);
app.use('/api', notificationRoutes);

// Root info fallback
app.get('/', (req, res) => {
  res.json({
    name: 'Pulse Social Fintech MVP API',
    version: '1.0.0',
    docs: '/api/health'
  });
});

// Central error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error'
  });
});

async function startServer(port = process.env.PORT || 4000) {
  const dbStatus = await db.initDb();
  const server = http.createServer(app);
  initSocket(server);

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(port, () => {
      const actualPort = server.address().port;
      if (process.env.NODE_ENV !== 'test') {
        console.log(
          `🚀 Pulse Backend running on http://localhost:${actualPort} (DB mode: ${dbStatus.mode})`
        );
      }
      resolve({ app, server, port: actualPort, dbMode: dbStatus.mode });
    });
  });
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error('Failed to start Pulse Backend:', err);
    process.exit(1);
  });
}

module.exports = {
  app,
  startServer
};
