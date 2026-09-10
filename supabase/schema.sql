-- ==============================================================================
-- SAMITI: COMMITTEE FUND & PAYMENT TRACKER SUPABASE SCHEMA
-- Copy and paste this whole script into your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Create Settings Table
CREATE TABLE IF NOT EXISTS committee_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  committee_name TEXT NOT NULL DEFAULT 'Vikas Sahayog Samiti',
  tagline TEXT DEFAULT 'Building Community Trust & Shared Prosperity',
  monthly_amount NUMERIC NOT NULL DEFAULT 1000,
  upi_id TEXT NOT NULL DEFAULT 'samiti@upi',
  payee_name TEXT NOT NULL DEFAULT 'Vikas Samiti Treasury',
  admin_pin TEXT NOT NULL DEFAULT '1234',
  currency TEXT DEFAULT 'INR',
  admin_name TEXT DEFAULT 'Rajesh Sharma',
  admin_phone TEXT DEFAULT '9876543210',
  start_month INT DEFAULT 1,
  start_year INT DEFAULT 2026,
  reminder_template_hindi TEXT,
  reminder_template_english TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration support for existing tables:
ALTER TABLE committee_settings ADD COLUMN IF NOT EXISTS admin_name TEXT DEFAULT 'Rajesh Sharma';
ALTER TABLE committee_settings ADD COLUMN IF NOT EXISTS admin_phone TEXT DEFAULT '9876543210';

-- Insert Default Settings if empty
INSERT INTO committee_settings (id, committee_name, tagline, monthly_amount, upi_id, payee_name, admin_name, admin_phone, admin_pin)
VALUES ('default', 'Vikas Sahayog Samiti', 'Building Community Trust & Shared Prosperity', 1000, 'samiti@upi', 'Vikas Samiti Treasury', 'Rajesh Sharma', '9876543210', '1234')
ON CONFLICT (id) DO NOTHING;

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

-- Create index for faster UTR uniqueness lookups
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
-- INITIAL SEED DATA (10 Active Members, Payments, and Sample Expenses)
-- ==============================================================================

INSERT INTO members (id, name, phone, joined_month, joined_year, status, role, notes) VALUES
  ('mem_1', 'Rajesh Sharma', '9876543210', 1, 2026, 'ACTIVE', 'ADMIN', 'Committee President / Organizer'),
  ('mem_2', 'Sunil Verma', '9876543211', 1, 2026, 'ACTIVE', 'MEMBER', NULL),
  ('mem_3', 'Ramesh Gupta', '9876543212', 1, 2026, 'ACTIVE', 'MEMBER', NULL),
  ('mem_4', 'Anil Kumar', '9876543213', 1, 2026, 'ACTIVE', 'MEMBER', NULL),
  ('mem_5', 'Manoj Tiwari', '9876543214', 1, 2026, 'ACTIVE', 'MEMBER', NULL),
  ('mem_6', 'Suresh Patel', '9876543215', 1, 2026, 'ACTIVE', 'MEMBER', NULL),
  ('mem_7', 'Deepak Singh', '9876543216', 1, 2026, 'ACTIVE', 'MEMBER', NULL),
  ('mem_8', 'Sanjay Joshi', '9876543217', 1, 2026, 'ACTIVE', 'MEMBER', NULL),
  ('mem_9', 'Vikram Chauhan', '9876543218', 1, 2026, 'ACTIVE', 'MEMBER', NULL),
  ('mem_10', 'Rakesh Agarwal', '9876543219', 1, 2026, 'ACTIVE', 'MEMBER', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO expenses (id, title, category, amount, date, description, recorded_by, receipt_note) VALUES
  ('exp_1', 'Committee Register & Account Books', 'ADMINISTRATIVE', 650, '2026-01-15', 'Physical ledger diary, stamp, and receipt pads for record keeping.', 'Admin', 'Stationery Bill #12'),
  ('exp_2', 'First Member General Meeting Refreshment', 'EVENT', 1200, '2026-02-05', 'Tea and snacks for all 10 members during the kick-off meeting.', 'Admin', 'Catering Memo')
ON CONFLICT (id) DO NOTHING;

-- Seed initial January 2026 contributions
INSERT INTO payments (id, member_id, member_name, month, year, amount, utr_number, method, status, paid_at, verified_at, verified_by) VALUES
  ('pay_jan_mem_1', 'mem_1', 'Rajesh Sharma', 1, 2026, 1000, '601508921470', 'UPI_QR', 'VERIFIED', '2026-01-02 10:00:00+00', '2026-01-02 12:00:00+00', 'Admin'),
  ('pay_jan_mem_2', 'mem_2', 'Sunil Verma', 1, 2026, 1000, '601518921471', 'CASH', 'VERIFIED', '2026-01-03 10:00:00+00', '2026-01-03 12:00:00+00', 'Admin'),
  ('pay_jan_mem_3', 'mem_3', 'Ramesh Gupta', 1, 2026, 1000, '601528921472', 'UPI_QR', 'VERIFIED', '2026-01-04 10:00:00+00', '2026-01-04 12:00:00+00', 'Admin'),
  ('pay_jan_mem_4', 'mem_4', 'Anil Kumar', 1, 2026, 1000, '601538921473', 'CASH', 'VERIFIED', '2026-01-05 10:00:00+00', '2026-01-05 12:00:00+00', 'Admin'),
  ('pay_jan_mem_5', 'mem_5', 'Manoj Tiwari', 1, 2026, 1000, '601548921474', 'UPI_QR', 'VERIFIED', '2026-01-06 10:00:00+00', '2026-01-06 12:00:00+00', 'Admin'),
  ('pay_jan_mem_6', 'mem_6', 'Suresh Patel', 1, 2026, 1000, '601558921475', 'CASH', 'VERIFIED', '2026-01-07 10:00:00+00', '2026-01-07 12:00:00+00', 'Admin'),
  ('pay_jan_mem_7', 'mem_7', 'Deepak Singh', 1, 2026, 1000, '601568921476', 'UPI_QR', 'VERIFIED', '2026-01-08 10:00:00+00', '2026-01-08 12:00:00+00', 'Admin'),
  ('pay_jan_mem_8', 'mem_8', 'Sanjay Joshi', 1, 2026, 1000, '601578921477', 'CASH', 'VERIFIED', '2026-01-09 10:00:00+00', '2026-01-09 12:00:00+00', 'Admin'),
  ('pay_jan_mem_9', 'mem_9', 'Vikram Chauhan', 1, 2026, 1000, '601588921478', 'UPI_QR', 'VERIFIED', '2026-01-10 10:00:00+00', '2026-01-10 12:00:00+00', 'Admin'),
  ('pay_jan_mem_10', 'mem_10', 'Rakesh Agarwal', 1, 2026, 1000, '601598921479', 'CASH', 'VERIFIED', '2026-01-11 10:00:00+00', '2026-01-11 12:00:00+00', 'Admin')
ON CONFLICT (id) DO NOTHING;
