import { NextResponse } from 'next/server';
import { getSettings, updateSettings, verifyAdminPin } from '@/lib/store';

export async function GET() {
  try {
    const settings = await getSettings();
    const { adminPin, ...publicSettings } = settings;
    return NextResponse.json({ settings: publicSettings }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=30',
        'CDN-Cache-Control': 'public, s-maxage=3, stale-while-revalidate=30'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { adminPin, updates } = body;

    if (!(await verifyAdminPin(adminPin))) {
      return NextResponse.json({ error: 'Unauthorized: Invalid Admin PIN' }, { status: 401 });
    }

    const updated = await updateSettings(updates, adminPin);
    const { adminPin: _, ...publicSettings } = updated;
    return NextResponse.json({ settings: publicSettings, message: 'Settings updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 });
  }
}
