import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getSession, isAdminSession } from '@/lib/session';

export async function GET(request: Request) {
  if (!isAdminSession(getSession(request))) {
    return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });
  }

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({
      configured: false,
      isOperational: false,
      error: 'Supabase is not configured'
    });
  }

  const results: any = {
    configured: true,
    usesServerCredentials: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  };

  // Read-only checks only. Diagnostics must never insert or delete production rows.
  const selectMembers = await supabase.from('members').select('id', { count: 'exact', head: true });
  results.selectMembers = {
    count: selectMembers.count ?? 0,
    error: selectMembers.error ? { code: selectMembers.error.code, message: selectMembers.error.message } : null
  };

  const selectPayments = await supabase.from('payments').select('id', { count: 'exact', head: true });
  results.selectPayments = {
    count: selectPayments.count ?? 0,
    error: selectPayments.error ? { code: selectPayments.error.code, message: selectPayments.error.message } : null
  };

  const selectSettings = await supabase.from('committee_settings').select('id', { count: 'exact', head: true });
  results.selectSettings = {
    count: selectSettings.count ?? 0,
    error: selectSettings.error ? { code: selectSettings.error.code, message: selectSettings.error.message } : null
  };

  results.isOperational = Boolean(!selectMembers.error && !selectPayments.error && !selectSettings.error);

  return NextResponse.json(results);
}
