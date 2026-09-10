import { NextResponse } from 'next/server';
import { getPaymentMatrix } from '@/lib/store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

    const matrix = await getPaymentMatrix(year);
    return NextResponse.json({ year, matrix });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch matrix' }, { status: 500 });
  }
}
