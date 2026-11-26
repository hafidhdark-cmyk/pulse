const { app } = require('../backend/src/server');
const db = require('../backend/src/db');

let initPromise = null;

function ensureDb() {
  if (!initPromise) {
    initPromise = db.initDb().catch((err) => {
      console.warn('[Vercel Serverless] DB init warning:', err.message);
    });
  }
  return initPromise;
}

module.exports = async (req, res) => {
  await ensureDb();
  return app(req, res);
};
