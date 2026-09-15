import { NextResponse } from 'next/server';
import { getAllPayments, deletePayment, verifyAdminPin } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const payments = await getAllPayments();
    return NextResponse.json({ payments }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const adminPin = searchParams.get('adminPin');

    if (!id) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    if (adminPin) {
      const isValid = await verifyAdminPin(adminPin.trim());
      if (!isValid) {
        return NextResponse.json({ error: 'Unauthorized: Invalid Admin PIN' }, { status: 401 });
      }
    }

    await deletePayment(id);
    return NextResponse.json({ success: true, message: 'Payment record deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete payment' }, { status: 500 });
  }
}
