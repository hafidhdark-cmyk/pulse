-- Pulse Social Fintech MVP — PostgreSQL Schema (Nobus Managed DB / Docker Postgres)

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  username VARCHAR(60) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_color VARCHAR(24) DEFAULT '#2563EB',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallets (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
  currency VARCHAR(8) NOT NULL DEFAULT 'NGN',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(40) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'NGN',
  reference VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON transactions(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS savings_plans (
  id VARCHAR(36) PRIMARY KEY,
  creator_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(160) NOT NULL,
  description TEXT DEFAULT '',
  target_amount NUMERIC(15, 2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  type VARCHAR(20) NOT NULL CHECK (type IN ('PERSONAL', 'GROUP')),
  invite_code VARCHAR(20) UNIQUE NOT NULL,
  frequency VARCHAR(30) DEFAULT 'FLEXIBLE',
  deadline TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS savings_members (
  id VARCHAR(36) PRIMARY KEY,
  plan_id VARCHAR(36) NOT NULL REFERENCES savings_plans(id) ON DELETE CASCADE,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
  contributed_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(plan_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_savings_members_user ON savings_members(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_members_plan ON savings_members(plan_id);

CREATE TABLE IF NOT EXISTS group_messages (
  id VARCHAR(36) PRIMARY KEY,
  plan_id VARCHAR(36) NOT NULL REFERENCES savings_plans(id) ON DELETE CASCADE,
  sender_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type VARCHAR(30) NOT NULL DEFAULT 'CHAT' CHECK (type IN ('CHAT', 'ACTIVITY_ALERT')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_messages_plan_created ON group_messages(plan_id, created_at ASC);

CREATE TABLE IF NOT EXISTS payment_requests (
  id VARCHAR(36) PRIMARY KEY,
  creator_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id VARCHAR(36) REFERENCES savings_plans(id) ON DELETE SET NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(8) NOT NULL DEFAULT 'NGN',
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID')),
  paid_by_user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(40) NOT NULL DEFAULT 'INFO',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
