import { NextResponse } from 'next/server';
import { getFullCommitteeSync } from '@/lib/store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

    const data = await getFullCommitteeSync(year);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=30',
        'CDN-Cache-Control': 'public, s-maxage=3, stale-while-revalidate=30',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=3, stale-while-revalidate=30'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to synchronize committee data' }, { status: 500 });
  }
}
