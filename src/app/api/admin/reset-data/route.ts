import { NextResponse } from 'next/server';
import { resetToFreshStart, verifyAdminPin } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminPin } = body;

    if (!adminPin) {
      return NextResponse.json({ success: false, error: 'Admin PIN is required' }, { status: 400 });
    }

    if (!(await verifyAdminPin(adminPin.toString().trim()))) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Incorrect Admin PIN' }, { status: 401 });
    }

    await resetToFreshStart(adminPin.toString().trim());

    return NextResponse.json({
      success: true,
      message: 'All dummy test data wiped successfully! Your committee is ready for fresh members.'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to reset data' }, { status: 500 });
  }
}
