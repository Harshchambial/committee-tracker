import { NextResponse } from 'next/server';
import { logOfflinePayment, verifyAdminPin } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      memberId, 
      contributorName, 
      contributorPhone, 
      month, 
      year, 
      amount, 
      method, 
      notes, 
      adminPin, 
      verifiedBy,
      contributionType,
      purpose
    } = body;

    if (!(await verifyAdminPin(adminPin))) {
      return NextResponse.json({ error: 'Unauthorized: Invalid Admin PIN' }, { status: 401 });
    }

    const isPublic = contributionType === 'PUBLIC_SEVA';
    if (!isPublic && (!memberId || !month || !year)) {
      return NextResponse.json({ error: 'Member, month, and year are required for core monthly contributions' }, { status: 400 });
    }
    if (isPublic && !contributorName && !memberId) {
      return NextResponse.json({ error: 'Contributor name is required' }, { status: 400 });
    }

    const currentDate = new Date();
    const payment = await logOfflinePayment({
      memberId,
      contributorName,
      contributorPhone,
      month: month ? parseInt(month, 10) : (currentDate.getMonth() + 1),
      year: year ? parseInt(year, 10) : currentDate.getFullYear(),
      amount: amount ? parseFloat(amount) : (isPublic ? 500 : 1000),
      method: method || 'CASH',
      contributionType: isPublic ? 'PUBLIC_SEVA' : 'CORE_MONTHLY',
      purpose,
      notes,
      verifiedBy: verifiedBy || 'Admin'
    });

    return NextResponse.json({ 
      success: true, 
      payment, 
      message: isPublic 
        ? 'Public cash contribution verified and recorded!' 
        : 'Core monthly payment verified and recorded!' 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to log offline payment' }, { status: 400 });
  }
}
