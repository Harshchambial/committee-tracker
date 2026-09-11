import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({
      configured: false,
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
    count: selectMembers.data?.length,
    error: selectMembers.error
  };

  // 2. Test Insert Dummy Member
  const testMemberId = `test_${Date.now()}`;
  const insertMember = await supabase.from('members').insert({
    id: testMemberId,
    name: 'Test Diagnostics Member',
    phone: '9999999999',
    joined_month: 1,
    joined_year: 2026,
    status: 'ACTIVE',
    role: 'MEMBER'
  }).select();

  results.insertMember = {
    data: insertMember.data,
    error: insertMember.error
  };

  // Clean up test member if inserted
  if (insertMember.data && insertMember.data.length > 0) {
    await supabase.from('members').delete().eq('id', testMemberId);
  }

  // 3. Test Select Payments
  const selectPayments = await supabase.from('payments').select('*');
  results.selectPayments = {
    count: selectPayments.data?.length,
    error: selectPayments.error
  };

  // 4. Test Insert Dummy Payment
  const testPaymentId = `test_pay_${Date.now()}`;
  const insertPayment = await supabase.from('payments').insert({
    id: testPaymentId,
    member_id: null,
    member_name: 'Test Contributor',
    month: 9,
    year: 2026,
    amount: 1000,
    method: 'CASH',
    status: 'VERIFIED'
  }).select();

  results.insertPayment = {
    data: insertPayment.data,
    error: insertPayment.error
  };

  // Clean up test payment if inserted
  if (insertPayment.data && insertPayment.data.length > 0) {
    await supabase.from('payments').delete().eq('id', testPaymentId);
  }

  // 5. Test Settings
  const selectSettings = await supabase.from('committee_settings').select('*');
  results.selectSettings = {
    data: selectSettings.data,
    error: selectSettings.error
  };

  return NextResponse.json(results);
}
