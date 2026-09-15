import { NextResponse } from 'next/server';
import { getAllExpenses, addExpense, updateExpense, deleteExpense, verifyAdminPin } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const expenses = await getAllExpenses();
    return NextResponse.json({ expenses }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, amount, date, description, receiptNote, adminPin, recordedBy, images, status, location } = body;

    if (!(await verifyAdminPin(adminPin))) {
      return NextResponse.json({ error: 'Unauthorized: Invalid Admin PIN' }, { status: 401 });
    }

    if (!title || !amount || !category) {
      return NextResponse.json({ error: 'Title, category, and amount are required' }, { status: 400 });
    }

    const expense = await addExpense({
      title: title.trim(),
      category,
      amount: parseFloat(amount),
      date: date || new Date().toISOString().split('T')[0],
      description: description?.trim() || '',
      receiptNote: receiptNote?.trim(),
      recordedBy: recordedBy || 'Admin',
      images: Array.isArray(images) ? images : [],
      status: status || 'COMPLETED',
      location: location?.trim() || undefined
    });

    return NextResponse.json({ success: true, expense, message: 'Expense recorded successfully' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to record expense' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, adminPin, ...updates } = body;

    if (!(await verifyAdminPin(adminPin || ''))) {
      return NextResponse.json({ error: 'Unauthorized: Invalid Admin PIN' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

    if (updates.amount !== undefined) {
      updates.amount = parseFloat(updates.amount);
    }

    const updated = await updateExpense(id, updates);
    return NextResponse.json({ success: true, expense: updated, message: 'Expense updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update expense' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const adminPin = searchParams.get('adminPin');

    if (!(await verifyAdminPin(adminPin || ''))) {
      return NextResponse.json({ error: 'Unauthorized: Invalid Admin PIN' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

    await deleteExpense(id);
    return NextResponse.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete expense' }, { status: 500 });
  }
}
