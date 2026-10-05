import { NextResponse } from 'next/server';
import { updateMemberPin, adminResetMemberPin, verifyAdminPin } from '@/lib/store';
import { getSession, isAdminSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, currentPin, newPin, adminPin } = body;
    const session = getSession(request);

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required.' }, { status: 400 });
    }

    // Admin Reset Flow
    if (adminPin) {
      if (!isAdminSession(session)) {
        return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });
      }
      const isValid = await verifyAdminPin(adminPin.trim());
      if (!isValid) {
        return NextResponse.json({ error: 'Unauthorized: Invalid Admin PIN' }, { status: 401 });
      }

      const result = await adminResetMemberPin(memberId);
      return NextResponse.json(result);
    }

    // Self-Service Member Flow
    if (!session || session.sub !== memberId) {
      return NextResponse.json({ error: 'You can only change your own PIN.' }, { status: 403 });
    }
    if (!currentPin || !newPin) {
      return NextResponse.json(
        { error: 'Current PIN and new 4-digit PIN are both required.' }, 
        { status: 400 }
      );
    }

    const result = await updateMemberPin(memberId, currentPin, newPin);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update PIN.' }, 
      { status: 400 }
    );
  }
}
