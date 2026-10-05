import { NextResponse } from 'next/server';
import { getFullCommitteeSync } from '@/lib/store';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: Request) {
  try {
    const session = getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

    const data = await getFullCommitteeSync(year);

    const { adminPin: _adminPin, ...safeSettings } = data.settings;
    const safeMembers = data.members.map(({ pin: _pin, ...member }) => member);
    const safeMatrix = data.matrix.map(row => {
      const { pin: _pin, ...member } = row.member;
      return { ...row, member };
    });

    return NextResponse.json({
      ...data,
      settings: safeSettings,
      members: safeMembers,
      matrix: safeMatrix
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to synchronize committee data' }, { status: 500 });
  }
}
