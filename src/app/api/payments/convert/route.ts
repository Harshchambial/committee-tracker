import { NextResponse } from 'next/server';
import { convertPaymentToCore, verifyAdminPin } from '@/lib/store';
import { getSession, isAdminSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    if (!isAdminSession(getSession(request))) {
      return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });
    }
    const body = await request.json();
    const { paymentId, memberId, month, year, adminPin } = body;

    if (!paymentId || !memberId || !month || !year) {
      return NextResponse.json(
        { error: 'paymentId, memberId, month, and year are required.' }, 
        { status: 400 }
      );
    }

    if (!adminPin || !(await verifyAdminPin(adminPin.trim()))) {
      return NextResponse.json({ error: 'Unauthorized: Invalid Admin PIN' }, { status: 401 });
    }

    const updatedPayment = await convertPaymentToCore(
      paymentId, 
      memberId, 
      Number(month), 
      Number(year)
    );

    return NextResponse.json({
      success: true,
      message: 'Payment converted to Core Member contribution successfully!',
      payment: updatedPayment
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to convert payment' }, 
      { status: 500 }
    );
  }
}
