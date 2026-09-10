import { NextResponse } from 'next/server';
import { getAllPayments } from '@/lib/store';

export async function GET() {
  try {
    const payments = await getAllPayments();
    return NextResponse.json({ payments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch payments' }, { status: 500 });
  }
}
