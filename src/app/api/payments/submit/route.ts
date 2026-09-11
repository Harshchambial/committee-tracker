import { NextResponse } from 'next/server';
import { submitPayment } from '@/lib/store';

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
      utrNumber, 
      notes, 
      contributionType, 
      purpose 
    } = body;

    const isPublic = contributionType === 'PUBLIC_SEVA';

    if (!utrNumber) {
      return NextResponse.json({ 
        error: '12-digit UPI Reference / UTR Number is required.' 
      }, { status: 400 });
    }

    if (isPublic) {
      if (!contributorName && !memberId) {
        return NextResponse.json({ 
          error: 'Please enter your name for the public contribution receipt.' 
        }, { status: 400 });
      }
      if (!amount || parseFloat(amount) <= 0) {
        return NextResponse.json({ 
          error: 'Please enter a valid contribution amount.' 
        }, { status: 400 });
      }
    } else {
      if (!memberId || !month || !year) {
        return NextResponse.json({ 
          error: 'Member, month, and year are required for core monthly contributions.' 
        }, { status: 400 });
      }
    }

    const currentDate = new Date();
    const payment = await submitPayment({
      memberId,
      contributorName,
      contributorPhone,
      month: month ? parseInt(month, 10) : (currentDate.getMonth() + 1),
      year: year ? parseInt(year, 10) : currentDate.getFullYear(),
      amount: amount ? parseFloat(amount) : 1000,
      utrNumber: utrNumber.toString(),
      contributionType: isPublic ? 'PUBLIC_SEVA' : 'CORE_MONTHLY',
      purpose,
      notes
    });

    return NextResponse.json({ 
      success: true, 
      payment, 
      message: isPublic 
        ? 'Thank you for your generous public contribution! It is now pending organizer verification.' 
        : 'Payment proof submitted successfully! It is now pending admin verification.' 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit payment' }, { status: 400 });
  }
}
