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
      paymentMethod,
      notes, 
      contributionType, 
      purpose 
    } = body;

    const isPublic = contributionType === 'PUBLIC_SEVA';
    const isCash = paymentMethod === 'CASH';

    if (!isCash && !utrNumber) {
      return NextResponse.json({ 
        error: '12-digit UPI Reference / UTR Number is required for online UPI payments.' 
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
      utrNumber: utrNumber ? utrNumber.toString() : undefined,
      paymentMethod: isCash ? 'CASH' : 'UPI_QR',
      contributionType: isPublic ? 'PUBLIC_SEVA' : 'CORE_MONTHLY',
      purpose,
      notes
    });

    const message = isCash
      ? (isPublic 
          ? 'Thank you! Your cash contribution has been recorded and is pending organizer verification.' 
          : 'Cash payment reported successfully! It is now pending organizer verification.')
      : (isPublic 
          ? 'Thank you for your generous public contribution! It is now pending organizer verification.' 
          : 'Payment proof submitted successfully! It is now pending admin verification.');

    return NextResponse.json({ 
      success: true, 
      payment, 
      message
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit payment' }, { status: 400 });
  }
}
