import { NextResponse } from 'next/server';
import { verifyAdminPin } from '@/lib/store';
import { getSession, isAdminSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    if (!isAdminSession(getSession(request))) {
      return NextResponse.json({ valid: false, error: 'Administrator access required' }, { status: 403 });
    }
    const { pin } = await request.json();
    if (!pin) {
      return NextResponse.json({ valid: false, error: 'PIN is required' }, { status: 400 });
    }

    const isValid = await verifyAdminPin(pin.toString());
    return NextResponse.json({ valid: isValid });
  } catch (error: any) {
    return NextResponse.json({ valid: false, error: 'Verification failed' }, { status: 500 });
  }
}
