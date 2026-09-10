import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ error: 'Supabase not configured' });
  }

  // Test insert
  const insertRes = await supabase.from('members').insert({
    id: 'test_' + Date.now(),
    name: 'Test Name',
    phone: '9999999999',
    role: 'MEMBER',
    status: 'ACTIVE'
  }).select();

  return NextResponse.json({
    insertData: insertRes.data,
    insertError: insertRes.error
  });
}
