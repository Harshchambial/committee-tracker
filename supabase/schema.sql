-- ==============================================================================
-- SAMITI: COMMITTEE FUND & PAYMENT TRACKER SUPABASE SCHEMA (CLEAN SLATE)
-- Run this SQL in Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Create Settings Table
CREATE TABLE IF NOT EXISTS committee_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  committee_name TEXT NOT NULL DEFAULT 'Vikas Sahayog Samiti',
  tagline TEXT DEFAULT 'Building Community Trust & Shared Prosperity',
  monthly_amount NUMERIC NOT NULL DEFAULT 1000,
  upi_id TEXT NOT NULL DEFAULT 'samiti@upi',
  payee_name TEXT NOT NULL DEFAULT 'Narinder Singh',
  admin_pin TEXT NOT NULL DEFAULT '1234',
  currency TEXT DEFAULT 'INR',
  admin_name TEXT DEFAULT 'Narinder Singh',
  admin_phone TEXT DEFAULT '9876543210',
  start_month INT DEFAULT 1,
  start_year INT DEFAULT 2026,
  reminder_template_hindi TEXT,
  reminder_template_english TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration support for existing tables:
ALTER TABLE committee_settings ADD COLUMN IF NOT EXISTS admin_name TEXT DEFAULT 'Narinder Singh';
ALTER TABLE committee_settings ADD COLUMN IF NOT EXISTS admin_phone TEXT DEFAULT '9876543210';

-- Upsert Default Settings for Narinder Singh
INSERT INTO committee_settings (id, committee_name, tagline, monthly_amount, upi_id, payee_name, admin_name, admin_phone, admin_pin)
VALUES ('default', 'Vikas Sahayog Samiti', 'Building Community Trust & Shared Prosperity', 1000, 'samiti@upi', 'Narinder Singh', 'Narinder Singh', '9876543210', '1234')
ON CONFLICT (id) DO UPDATE SET 
  admin_name = 'Narinder Singh',
  payee_name = 'Narinder Singh';

-- 2. Create Members Table
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  joined_month INT DEFAULT 1,
  joined_year INT DEFAULT 2026,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  role TEXT NOT NULL DEFAULT 'MEMBER',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 1000,
  utr_number TEXT,
  method TEXT NOT NULL DEFAULT 'UPI_QR',
  status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by TEXT,
  rejection_reason TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_payments_utr ON payments (utr_number);
CREATE INDEX IF NOT EXISTS idx_payments_member_month ON payments (member_id, month, year);

-- 4. Create Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  recorded_by TEXT DEFAULT 'Admin',
  receipt_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 5. DISABLE ROW LEVEL SECURITY (RLS) & GRANT PERMISSIONS
-- Prevents Supabase error 42501 when web app adds/edits/deletes members
-- ==============================================================================
ALTER TABLE committee_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- ==============================================================================
-- 6. CLEAN SLATE: WIPE ALL DUMMY DATA & KEEP ONLY ADMIN (NARINDER SINGH)
-- ==============================================================================
DELETE FROM payments;
DELETE FROM expenses;
DELETE FROM members WHERE id != 'mem_1';

INSERT INTO members (id, name, phone, joined_month, joined_year, status, role, notes) 
VALUES ('mem_1', 'Narinder Singh', '9876543210', 1, 2026, 'ACTIVE', 'ADMIN', 'Committee President / Organizer')
ON CONFLICT (id) DO UPDATE SET 
  name = 'Narinder Singh', 
  role = 'ADMIN';
