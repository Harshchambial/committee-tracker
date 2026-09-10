import { NextResponse } from 'next/server';
import { verifyPayment, verifyAdminPin } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paymentId, action, adminPin, rejectionReason, verifiedBy } = body;

    if (!(await verifyAdminPin(adminPin))) {
      return NextResponse.json({ error: 'Unauthorized: Invalid Admin PIN' }, { status: 401 });
    }

    if (!paymentId || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Valid payment ID and action (APPROVE or REJECT) required' }, { status: 400 });
    }

    const updated = await verifyPayment(paymentId, action, verifiedBy || 'Admin', rejectionReason);
    return NextResponse.json({ 
      success: true, 
      payment: updated, 
      message: action === 'APPROVE' ? 'Payment verified and credited to Treasury!' : 'Payment marked as rejected.' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to verify payment' }, { status: 500 });
  }
}
