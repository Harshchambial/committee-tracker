import { NextResponse } from 'next/server';
import { logAdvancePayment, verifyAdminPin, getSettings } from '@/lib/store';
import { getSession, isAdminSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    if (!isAdminSession(getSession(request))) {
      return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });
    }
    const body = await request.json();
    const { 
      memberId, 
      startMonth, 
      startYear, 
      totalMonths, 
      amount, 
      method = 'CASH', 
      notes, 
      adminPin,
      verifiedBy 
    } = body;

    if (!memberId || !startMonth || !startYear || !amount) {
      return NextResponse.json(
        { error: 'memberId, startMonth, startYear, and amount are required.' }, 
        { status: 400 }
      );
    }

    if (!adminPin || !(await verifyAdminPin(adminPin.trim()))) {
      return NextResponse.json({ error: 'Unauthorized: Invalid Admin PIN' }, { status: 401 });
    }

    const settings = await getSettings();
    const monthlyAmt = settings.monthlyAmount || 1000;
    const computedMonths = totalMonths || Math.max(1, Math.round(Number(amount) / monthlyAmt));

    const result = await logAdvancePayment({
      memberId,
      startMonth: Number(startMonth),
      startYear: Number(startYear),
      totalMonths: computedMonths,
      amount: Number(amount),
      method,
      notes,
      verifiedBy: verifiedBy || settings.adminName || 'Narinder Singh'
    });

    return NextResponse.json({
      success: true,
      message: `Successfully logged advance payment of ₹${result.totalAmount.toLocaleString('en-IN')} across ${result.totalMonths} months for ${result.member.name}!`,
      batchId: result.batchId,
      totalMonths: result.totalMonths,
      totalAmount: result.totalAmount,
      records: result.records
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to record advance payment' }, 
      { status: 500 }
    );
  }
}
