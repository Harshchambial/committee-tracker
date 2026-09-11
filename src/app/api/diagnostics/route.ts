import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({
      configured: false,
      isOperational: false,
      error: 'Supabase is not configured'
    });
  }

  const results: any = {
    configured: true,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
    hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  };

  // 1. Test Select Members
  const selectMembers = await supabase.from('members').select('*');
  results.selectMembers = {
    count: selectMembers.data?.length ?? 0,
    error: selectMembers.error ? { code: selectMembers.error.code, message: selectMembers.error.message } : null
  };

  // 2. Test Insert Dummy Member
  const testMemberId = `diag_test_${Date.now()}`;
  const insertMember = await supabase.from('members').insert({
    id: testMemberId,
    name: 'Diagnostic Health Check',
    phone: '9999999999',
    joined_month: 1,
    joined_year: 2026,
    status: 'ACTIVE',
    role: 'MEMBER'
  }).select();

  results.insertMember = {
    success: !insertMember.error,
    error: insertMember.error ? { code: insertMember.error.code, message: insertMember.error.message } : null
  };

  // Clean up test member if inserted
  if (insertMember.data && insertMember.data.length > 0) {
    await supabase.from('members').delete().eq('id', testMemberId);
  }

  // 3. Test Select Payments
  const selectPayments = await supabase.from('payments').select('*');
  results.selectPayments = {
    count: selectPayments.data?.length ?? 0,
    error: selectPayments.error ? { code: selectPayments.error.code, message: selectPayments.error.message } : null
  };

  // 4. Test Insert Dummy Payment
  const testPaymentId = `diag_pay_${Date.now()}`;
  const insertPayment = await supabase.from('payments').insert({
    id: testPaymentId,
    member_id: null,
    member_name: 'Diagnostic Health Check',
    month: 9,
    year: 2026,
    amount: 1000,
    method: 'CASH',
    status: 'VERIFIED'
  }).select();

  results.insertPayment = {
    success: !insertPayment.error,
    error: insertPayment.error ? { code: insertPayment.error.code, message: insertPayment.error.message } : null
  };

  // Clean up test payment if inserted
  if (insertPayment.data && insertPayment.data.length > 0) {
    await supabase.from('payments').delete().eq('id', testPaymentId);
  }

  // 5. Test Settings
  const selectSettings = await supabase.from('committee_settings').select('*');
  results.selectSettings = {
    count: selectSettings.data?.length ?? 0,
    error: selectSettings.error ? { code: selectSettings.error.code, message: selectSettings.error.message } : null
  };

  const isRlsBlocked = Boolean(
    insertMember.error?.code === '42501' || 
    insertPayment.error?.code === '42501' ||
    insertMember.error?.message?.includes('row-level security') ||
    insertPayment.error?.message?.includes('row-level security')
  );

  results.rlsBlocked = isRlsBlocked;
  results.isOperational = Boolean(!insertMember.error && !insertPayment.error);

  results.sqlFix = `-- ==============================================================================
-- 1-CLICK FIX FOR SUPABASE DATABASE ACCESS (RUN IN SUPABASE SQL EDITOR)
-- ==============================================================================

-- 1. Disable Row Level Security on all application tables
ALTER TABLE IF EXISTS members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS committee_settings DISABLE ROW LEVEL SECURITY;

-- 2. Grant full read/write permissions to anon, authenticated, and service_role
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Ensure modern column support
ALTER TABLE IF EXISTS members ADD COLUMN IF NOT EXISTS member_type TEXT DEFAULT 'CORE';
ALTER TABLE IF EXISTS payments ADD COLUMN IF NOT EXISTS contribution_type TEXT DEFAULT 'CORE_MONTHLY';
ALTER TABLE IF EXISTS payments ADD COLUMN IF NOT EXISTS purpose TEXT;
ALTER TABLE IF EXISTS payments ADD COLUMN IF NOT EXISTS contributor_phone TEXT;
`;

  return NextResponse.json(results);
}
