import { NextResponse } from 'next/server';
import { getAllMembers, getSettings, verifyAdminPin } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, password, pin, phone, name, email } = body;

    // ADMIN LOGIN
    if (type === 'ADMIN') {
      const adminSecret = password || pin;
      if (!adminSecret) {
        return NextResponse.json({ success: false, error: 'Admin password/PIN is required' }, { status: 400 });
      }

      const isValid = await verifyAdminPin(adminSecret.toString().trim());
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Incorrect Admin password/PIN' }, { status: 401 });
      }

      const settings = await getSettings();
      return NextResponse.json({
        success: true,
        user: {
          name: settings.adminName || settings.payeeName || 'Admin / Organizer',
          phone: settings.adminPhone,
          role: 'ADMIN'
        }
      });
    }

    // MEMBER LOGIN
    if (type === 'MEMBER') {
      if (!phone) {
        return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
      }

      const cleanPhone = phone.toString().replace(/\D/g, '').slice(-10);
      if (cleanPhone.length < 10) {
        return NextResponse.json({ success: false, error: 'Please enter a valid 10-digit mobile number' }, { status: 400 });
      }

      const members = await getAllMembers();
      const matchedMember = members.find(m => {
        const mClean = m.phone.replace(/\D/g, '').slice(-10);
        return mClean === cleanPhone;
      });

      if (!matchedMember) {
        return NextResponse.json({
          success: false,
          error: `Mobile number (${cleanPhone}) is not registered in the committee. Please ask the Admin to add your name.`
        }, { status: 404 });
      }

      if (matchedMember.status !== 'ACTIVE') {
        return NextResponse.json({
          success: false,
          error: 'Your membership account is currently inactive. Please contact the Admin.'
        }, { status: 403 });
      }

      if (!pin) {
        return NextResponse.json({
          success: false,
          error: 'Please enter your 4-digit PIN. (Default PIN is 1234) / कृपया अपना 4-अंकों का पिन दर्ज करें (डिफ़ॉल्ट 1234 है)।'
        }, { status: 400 });
      }

      const expectedPin = (matchedMember.pin && matchedMember.pin.trim()) || '1234';
      if (pin.toString().trim() !== expectedPin) {
        return NextResponse.json({
          success: false,
          error: 'Incorrect PIN. Default PIN is 1234. If forgotten, ask Admin to reset it. / गलत पिन। प्रारंभिक पिन 1234 है।'
        }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        user: {
          id: matchedMember.id,
          name: matchedMember.name,
          phone: matchedMember.phone,
          email: matchedMember.email || email,
          role: matchedMember.role
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid login type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Login failed' }, { status: 500 });
  }
}
