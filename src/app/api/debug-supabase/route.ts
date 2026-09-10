import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ error: 'Supabase not configured' });
  }

  const selectRes = await supabase.from('members').select('*');
  const updateRes = await supabase.from('members').update({ name: 'Narinder Singh' }).eq('id', 'mem_1').select();

  return NextResponse.json({
    selectCount: selectRes.data?.length,
    selectError: selectRes.error,
    firstMember: selectRes.data?.[0],
    updateData: updateRes.data,
    updateError: updateRes.error
  });
}
