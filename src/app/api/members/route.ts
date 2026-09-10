import { NextResponse } from 'next/server';
import { getAllMembers, addMember, updateMember, deleteMember, verifyAdminPin } from '@/lib/store';

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

    if (!name || !phone) {
      return NextResponse.json({ error: 'Member name and phone are required' }, { status: 400 });
    }

    const now = new Date();
    const newMember = await addMember({
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim(),
      joinedMonth: joinedMonth || (now.getMonth() + 1),
      joinedYear: joinedYear || now.getFullYear(),
      status: 'ACTIVE',
      role: role || 'MEMBER',
      notes: notes?.trim()
    });

    return NextResponse.json({ member: newMember, message: 'Member added successfully' }, { status: 201 });
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
