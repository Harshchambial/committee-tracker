import { NextResponse } from 'next/server';
import { updateMemberPin, adminResetMemberPin, verifyAdminPin } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, currentPin, newPin, adminPin } = body;

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required.' }, { status: 400 });
    }

    // Admin Reset Flow
    if (adminPin) {
      const isValid = await verifyAdminPin(adminPin.trim());
      if (!isValid) {
        return NextResponse.json({ error: 'Unauthorized: Invalid Admin PIN' }, { status: 401 });
      }

      const result = await adminResetMemberPin(memberId);
      return NextResponse.json(result);
    }

    // Self-Service Member Flow
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
