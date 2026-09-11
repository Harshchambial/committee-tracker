import { NextResponse } from 'next/server';
import { getAllMembers, addMember, updateMember, deleteMember, verifyAdminPin, logOfflinePayment, getSettings } from '@/lib/store';

export async function GET() {
  try {
    const members = await getAllMembers();
    return NextResponse.json({ members });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, notes, adminPin, role, joinedMonth, joinedYear } = body;

    if (!(await verifyAdminPin(adminPin))) {
      return NextResponse.json({ error: 'Unauthorized: Incorrect Admin PIN' }, { status: 401 });
    }

    const cleanName = name.trim();
    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);

    if (!cleanName) {
      return NextResponse.json({ error: 'Member full name is required (सदस्य का नाम अनिवार्य है)' }, { status: 400 });
    }

    if (cleanPhone.length < 10) {
      return NextResponse.json({ error: 'Valid 10-digit mobile number is mandatory (10 अंकों का मोबाइल नंबर अनिवार्य है)' }, { status: 400 });
    }

    const now = new Date();
    const newMember = await addMember({
      name: cleanName,
      phone: cleanPhone,
      email: email?.trim(),
      joinedMonth: joinedMonth || (now.getMonth() + 1),
      joinedYear: joinedYear || now.getFullYear(),
      status: 'ACTIVE',
      role: role || 'MEMBER',
      memberType: body.memberType || 'CORE',
      notes: notes?.trim()
    });

    let initialPayment = null;
    if (body.hasPaid) {
      const settings = await getSettings();
      const pMonth = body.paidMonth ? parseInt(body.paidMonth, 10) : (now.getMonth() + 1);
      const pYear = body.paidYear ? parseInt(body.paidYear, 10) : now.getFullYear();
      const pMethod = body.paidMethod || 'CASH';
      const pAmount = body.paidAmount ? parseFloat(body.paidAmount) : (body.memberType === 'CORE' ? settings.monthlyAmount : 1000);
      const pContributionType = body.paidContributionType || (body.memberType === 'VOLUNTARY' ? 'PUBLIC_SEVA' : 'CORE_MONTHLY');
      const pPurpose = body.paidPurpose || (pContributionType === 'PUBLIC_SEVA' ? 'जन सहयोग एवं विकास कार्य' : undefined);

      initialPayment = await logOfflinePayment({
        memberId: newMember.id,
        contributorName: newMember.name,
        contributorPhone: newMember.phone,
        month: pMonth,
        year: pYear,
        amount: pAmount,
        method: pMethod,
        contributionType: pContributionType,
        purpose: pPurpose,
        notes: body.paidNotes || (pMethod === 'CASH' ? 'Cash payment received in hand' : 'Payment received via UPI/Direct'),
        verifiedBy: settings.adminName || 'Admin'
      });
    }

    return NextResponse.json({ 
      member: newMember, 
      payment: initialPayment,
      message: initialPayment 
        ? `Member added and initial payment recorded for ${newMember.name}!` 
        : 'Member added successfully' 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add member' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, adminPin, ...updates } = body;

    if (!(await verifyAdminPin(adminPin))) {
      return NextResponse.json({ error: 'Unauthorized: Incorrect Admin PIN' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const updated = await updateMember(id, updates);
    return NextResponse.json({ member: updated, message: 'Member updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update member' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const adminPin = searchParams.get('adminPin');

    if (!(await verifyAdminPin(adminPin || ''))) {
      return NextResponse.json({ error: 'Unauthorized: Incorrect Admin PIN' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    await deleteMember(id);
    return NextResponse.json({ message: 'Member deactivated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to deactivate member' }, { status: 500 });
  }
}
