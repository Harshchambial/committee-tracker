import { NextResponse } from 'next/server';
import { logOfflinePayment, verifyAdminPin } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, month, year, amount, method, notes, adminPin, verifiedBy } = body;

    if (!(await verifyAdminPin(adminPin))) {
      return NextResponse.json({ error: 'Unauthorized: Invalid Admin PIN' }, { status: 401 });
    }

    if (!memberId || !month || !year) {
      return NextResponse.json({ error: 'Member, month, and year are required' }, { status: 400 });
    }

    const payment = await logOfflinePayment({
      memberId,
      month: parseInt(month, 10),
      year: parseInt(year, 10),
      amount: amount ? parseFloat(amount) : 1000,
      method: method || 'CASH',
      notes,
      verifiedBy: verifiedBy || 'Admin'
    });

    return NextResponse.json({ 
      success: true, 
      payment, 
      message: 'Offline payment logged and verified!' 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to log offline payment' }, { status: 400 });
  }
}
