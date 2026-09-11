import { NextResponse } from 'next/server';
import { getTreasurySummary, getSettings } from '@/lib/store';

export async function GET() {
  try {
    const summary = await getTreasurySummary();
    const settings = await getSettings();
    return NextResponse.json({ summary, settings }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=30',
        'CDN-Cache-Control': 'public, s-maxage=3, stale-while-revalidate=30'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
