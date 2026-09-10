import { NextResponse } from 'next/server';
import { submitPayment } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, month, year, amount, utrNumber, notes } = body;

    if (!memberId || !month || !year || !utrNumber) {
      return NextResponse.json({ 
        error: 'Member, month, year, and 12-digit UTR/UPI Ref ID are required.' 
      }, { status: 400 });
    }

    const payment = await submitPayment({
      memberId,
      month: parseInt(month, 10),
      year: parseInt(year, 10),
      amount: amount ? parseFloat(amount) : 1000,
      utrNumber: utrNumber.toString(),
      notes
    });

    return NextResponse.json({ 
      success: true, 
      payment, 
      message: 'Payment proof submitted successfully! It is now pending admin verification.' 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit payment' }, { status: 400 });
  }
}
