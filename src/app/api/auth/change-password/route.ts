import { NextResponse } from 'next/server';
import { getSettings, updateSettings, verifyAdminPin } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: 'Both current password and new password are required' }, { status: 400 });
    }

    const cleanNewPass = newPassword.toString().trim();
    if (cleanNewPass.length < 4) {
      return NextResponse.json({ success: false, error: 'New password must be at least 4 characters/digits' }, { status: 400 });
    }

    const isCurrentValid = await verifyAdminPin(currentPassword.toString().trim());
    if (!isCurrentValid) {
      return NextResponse.json({ success: false, error: 'Incorrect current password' }, { status: 401 });
    }

    await updateSettings({ adminPin: cleanNewPass }, currentPassword.toString().trim());

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully! Please use your new password for your next login.'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to change password' }, { status: 500 });
  }
}
