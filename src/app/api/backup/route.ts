import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase, verifyAdminPin } from '@/lib/store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminPin = searchParams.get('adminPin');

    if (!verifyAdminPin(adminPin || '')) {
      return NextResponse.json({ error: 'Unauthorized: Invalid Admin PIN' }, { status: 401 });
    }

    const db = getDatabase();
    return new NextResponse(JSON.stringify(db, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="committee_backup_${new Date().toISOString().split('T')[0]}.json"`
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Backup failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminPin, backupData } = body;

    if (!verifyAdminPin(adminPin)) {
      return NextResponse.json({ error: 'Unauthorized: Invalid Admin PIN' }, { status: 401 });
    }

    if (!backupData || !backupData.members || !backupData.payments) {
      return NextResponse.json({ error: 'Invalid backup file format' }, { status: 400 });
    }

    saveDatabase(backupData);
    return NextResponse.json({ success: true, message: 'Database restored successfully!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Restore failed' }, { status: 500 });
  }
}
