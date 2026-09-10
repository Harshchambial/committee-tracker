import { NextResponse } from 'next/server';
import { getAllExpenses, addExpense, deleteExpense, verifyAdminPin } from '@/lib/store';

export async function GET() {
  try {
    const expenses = await getAllExpenses();
    return NextResponse.json({ expenses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, amount, date, description, receiptNote, adminPin, recordedBy } = body;

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
      recordedBy: recordedBy || 'Admin'
    });

    return NextResponse.json({ success: true, expense, message: 'Expense recorded successfully' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to record expense' }, { status: 500 });
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
