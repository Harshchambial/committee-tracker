import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  const start = Date.now();
  let dbStatus = 'disconnected';
  let latencyMs = 0;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('committee_settings').select('id').limit(1);
      latencyMs = Date.now() - start;
      if (!error && data) {
        dbStatus = 'healthy';
      } else {
        dbStatus = error?.message || 'query_failed';
      }
    } catch (e: any) {
      dbStatus = e.message || 'connection_exception';
    }
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      provider: 'Supabase PostgreSQL',
      configured: isSupabaseConfigured,
      status: dbStatus,
      latencyMs
    }
  }, {
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  });
}
