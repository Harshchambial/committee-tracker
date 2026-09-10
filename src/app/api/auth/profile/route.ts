import { NextResponse } from 'next/server';
import { getSettings, updateSettings, verifyAdminPin } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminPin, name, phone, newPin } = body;

    if (!adminPin) {
      return NextResponse.json({ success: false, error: 'Current Admin PIN/password is required to make changes' }, { status: 400 });
    }

    const isPinValid = await verifyAdminPin(adminPin.toString().trim());
    if (!isPinValid) {
      return NextResponse.json({ success: false, error: 'Incorrect Admin PIN. Please verify your current PIN.' }, { status: 401 });
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Admin name cannot be empty' }, { status: 400 });
    }

    const updates: any = {
      adminName: name.trim()
    };

    if (phone !== undefined) {
      updates.adminPhone = phone.toString().trim();
    }

    if (newPin && newPin.toString().trim().length > 0) {
      const cleanNewPin = newPin.toString().trim();
      if (cleanNewPin.length < 4) {
        return NextResponse.json({ success: false, error: 'New PIN/password must be at least 4 characters' }, { status: 400 });
      }
      updates.adminPin = cleanNewPin;
    }

    await updateSettings(updates, adminPin.toString().trim());

    return NextResponse.json({
      success: true,
      message: 'Admin profile updated successfully!',
      user: {
        name: updates.adminName,
        phone: updates.adminPhone,
        role: 'ADMIN'
      },
      newPin: updates.adminPin
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
