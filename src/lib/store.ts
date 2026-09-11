import fs from 'fs';
import path from 'path';
import { 
  CommitteeDatabase, 
  CommitteeSettings, 
  Member, 
  PaymentRecord, 
  ExpenseRecord, 
  TreasurySummary, 
  MemberMatrixRow, 
  PaymentStatus,
  PaymentMethod,
  ContributionType 
} from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

const DB_PATH = path.join(process.cwd(), 'data', 'committee_db.json');

const DEFAULT_SETTINGS: CommitteeSettings = {
  committeeName: 'Vikas Sahayog Samiti',
  tagline: 'Building Community Trust & Shared Prosperity',
  monthlyAmount: 1000,
  upiId: 'samiti@upi',
  payeeName: 'Narinder Singh',
  adminName: 'Narinder Singh',
  adminPhone: '9876543210',
  adminPin: '1234',
  currency: 'INR',
  startMonth: 1,
  startYear: 2026,
  reminderTemplateHindi: 'नमस्ते {NAME} जी, {COMMITTEE} का {MONTH} {YEAR} माह का ₹{AMOUNT} अंशदान अभी बकाया है। कृपया समय पर भुगतान करें। धन्यवाद!',
  reminderTemplateEnglish: 'Hello {NAME}, your monthly contribution of ₹{AMOUNT} for {MONTH} {YEAR} towards {COMMITTEE} is pending. Please pay at your earliest. Thank you!'
};

const INITIAL_MEMBERS: Member[] = [
  { id: 'mem_1', name: 'Narinder Singh', phone: '9876543210', joinedMonth: 1, joinedYear: 2026, status: 'ACTIVE', role: 'ADMIN', notes: 'Committee President / Organizer' }
];

const INITIAL_EXPENSES: ExpenseRecord[] = [];

function getInitialPayments(): PaymentRecord[] {
  return [];
}

// Fallback Local File Database
export function getLocalDatabase(): CommitteeDatabase {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const dataDir = path.dirname(DB_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const initialDb: CommitteeDatabase = {
        settings: DEFAULT_SETTINGS,
        members: INITIAL_MEMBERS,
        payments: getInitialPayments(),
        expenses: INITIAL_EXPENSES
      };

      fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }

    const content = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(content) as CommitteeDatabase;
  } catch (error) {
    return {
      settings: DEFAULT_SETTINGS,
      members: INITIAL_MEMBERS,
      payments: getInitialPayments(),
      expenses: INITIAL_EXPENSES
    };
  }
}

export function saveLocalDatabase(db: CommitteeDatabase): void {
  try {
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const tempPath = `${DB_PATH}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempPath, DB_PATH);
  } catch (error) {
    console.error('Error saving local database:', error);
  }
}

export function getDatabase(): CommitteeDatabase {
  return getLocalDatabase();
}

export function saveDatabase(db: CommitteeDatabase): void {
  saveLocalDatabase(db);
}

// ================= MEMBER OPERATIONS =================
export async function getAllMembers(): Promise<Member[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('members').select('*').order('name', { ascending: true });
      if (!error && Array.isArray(data)) {
        if (data.length > 0) {
          return data.map(m => ({
            id: m.id,
            name: m.name,
            phone: m.phone,
            email: m.email || undefined,
            joinedMonth: m.joined_month || 1,
            joinedYear: m.joined_year || 2026,
            status: m.status || 'ACTIVE',
            role: m.role || 'MEMBER',
            memberType: (m.member_type as 'CORE' | 'VOLUNTARY') || 'CORE',
            notes: m.notes || undefined
          }));
        } else {
          // Supabase connected but 0 members - seed the admin organizer
          try {
            const adminSeed = {
              id: 'mem_1',
              name: 'Narinder Singh',
              phone: '9876543210',
              joined_month: 1,
              joined_year: 2026,
              status: 'ACTIVE',
              role: 'ADMIN',
              notes: 'Committee President / Organizer'
            };
            const seedRes = await supabase.from('members').insert(adminSeed).select();
            if (!seedRes.error && seedRes.data && seedRes.data.length > 0) {
              return seedRes.data.map(m => ({
                id: m.id,
                name: m.name,
                phone: m.phone,
                email: m.email || undefined,
                joinedMonth: m.joined_month || 1,
                joinedYear: m.joined_year || 2026,
                status: m.status || 'ACTIVE',
                role: m.role || 'MEMBER',
                memberType: (m.member_type as 'CORE' | 'VOLUNTARY') || 'CORE',
                notes: m.notes || undefined
              }));
            }
          } catch (seedErr) {
            console.warn('Could not seed admin member in Supabase:', seedErr);
          }
        }
      }
    } catch (e) {
      console.error('Supabase get members failed, falling back:', e);
    }
  }
  const db = getDatabase();
  return db.members.map(m => ({
    ...m,
    memberType: m.memberType || 'CORE'
  }));
}

export async function addMember(memberData: Omit<Member, 'id'>): Promise<Member> {
  const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newMember: Member = { 
    ...memberData, 
    id,
    memberType: memberData.memberType || 'CORE'
  };

  if (isSupabaseConfigured && supabase) {
    const insertData: any = {
      id: newMember.id,
      name: newMember.name,
      phone: newMember.phone,
      email: newMember.email || null,
      joined_month: newMember.joinedMonth || 1,
      joined_year: newMember.joinedYear || 2026,
      status: newMember.status || 'ACTIVE',
      role: newMember.role || 'MEMBER',
      member_type: newMember.memberType || 'CORE',
      notes: newMember.notes || null
    };

    const { error } = await supabase.from('members').insert(insertData);
    if (error) {
      if (error.code === '42501' || error.message?.includes('row-level security')) {
        throw new Error('Supabase RLS Error: Row Level Security is blocking member creation. Please run the SQL fix in Supabase SQL Editor.');
      }
      console.warn('Supabase add member failed with member_type, retrying without it:', error.message);
      delete insertData.member_type;
      const retryRes = await supabase.from('members').insert(insertData);
      if (retryRes.error) {
        console.error('Supabase add member retry error:', retryRes.error.message);
        if (retryRes.error.code === '42501' || retryRes.error.message?.includes('row-level security')) {
          throw new Error('Supabase RLS Error: Row Level Security is blocking member creation. Please run the SQL fix in Supabase SQL Editor.');
        }
        throw new Error(`Database error adding member: ${retryRes.error.message}`);
      }
    }
  }

  const db = getDatabase();
  const existingIdx = db.members.findIndex(m => m.id === newMember.id);
  if (existingIdx >= 0) {
    db.members[existingIdx] = newMember;
  } else {
    db.members.push(newMember);
  }
  saveDatabase(db);
  return newMember;
}

export async function updateMember(id: string, updates: Partial<Member>): Promise<Member> {
  if (isSupabaseConfigured && supabase) {
    const updatePayload: any = {};
    if (updates.name !== undefined) updatePayload.name = updates.name;
    if (updates.phone !== undefined) updatePayload.phone = updates.phone;
    if (updates.status !== undefined) updatePayload.status = updates.status;
    if (updates.role !== undefined) updatePayload.role = updates.role;
    if (updates.memberType !== undefined) updatePayload.member_type = updates.memberType;
    if (updates.notes !== undefined) updatePayload.notes = updates.notes;
    const { error } = await supabase.from('members').update(updatePayload).eq('id', id);
    if (error) {
      if (error.code === '42501' || error.message?.includes('row-level security')) {
        throw new Error('Supabase RLS Error: Row Level Security is blocking member updates. Please run the SQL fix in Supabase SQL Editor.');
      }
      if (error.message?.includes('member_type')) {
        delete updatePayload.member_type;
        const retryRes = await supabase.from('members').update(updatePayload).eq('id', id);
        if (retryRes.error) throw new Error(`Database error updating member: ${retryRes.error.message}`);
      } else {
        throw new Error(`Database error updating member: ${error.message}`);
      }
    }
  }

  const db = getDatabase();
  const index = db.members.findIndex(m => m.id === id);
  if (index >= 0) {
    db.members[index] = { ...db.members[index], ...updates };
    saveDatabase(db);
    return db.members[index];
  }
  const fallbackMember: Member = {
    id,
    name: updates.name || 'Member',
    phone: updates.phone || '',
    joinedMonth: updates.joinedMonth || 1,
    joinedYear: updates.joinedYear || 2026,
    status: updates.status || 'ACTIVE',
    role: updates.role || 'MEMBER',
    memberType: updates.memberType || 'CORE',
    notes: updates.notes
  };
  db.members.push(fallbackMember);
  saveDatabase(db);
  return fallbackMember;
}

export async function deleteMember(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('payments').delete().eq('member_id', id);
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) {
      if (error.code === '42501' || error.message?.includes('row-level security')) {
        throw new Error('Supabase RLS Error: Row Level Security is blocking member deletion. Please run the SQL fix in Supabase SQL Editor.');
      }
      throw new Error(`Database error deleting member: ${error.message}`);
    }
  }

  const db = getDatabase();
  db.members = db.members.filter(m => m.id !== id);
  db.payments = db.payments.filter(p => p.memberId !== id);
  saveDatabase(db);
}

// ================= PAYMENT OPERATIONS =================
export async function getAllPayments(): Promise<PaymentRecord[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('payments').select('*').order('paid_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        return data.map(p => ({
          id: p.id,
          memberId: p.member_id,
          memberName: p.member_name,
          month: p.month,
          year: p.year,
          amount: Number(p.amount),
          utrNumber: p.utr_number || undefined,
          method: p.method as PaymentMethod,
          status: p.status as PaymentStatus,
          contributionType: (p.contribution_type as ContributionType) || (Number(p.amount) === 1000 ? 'CORE_MONTHLY' : 'PUBLIC_SEVA'),
          purpose: p.purpose || undefined,
          contributorPhone: p.contributor_phone || undefined,
          paidAt: p.paid_at,
          verifiedAt: p.verified_at || undefined,
          verifiedBy: p.verified_by || undefined,
          rejectionReason: p.rejection_reason || undefined,
          notes: p.notes || undefined
        }));
      }
    } catch (e) {
      console.error('Supabase get payments failed, falling back:', e);
    }
  }
  const db = getDatabase();
  return db.payments.map(p => ({
    ...p,
    contributionType: p.contributionType || (p.amount === 1000 ? 'CORE_MONTHLY' : 'PUBLIC_SEVA')
  }));
}

export async function submitPayment(data: {
  memberId?: string;
  contributorName?: string;
  contributorPhone?: string;
  month?: number;
  year?: number;
  amount: number;
  utrNumber: string;
  contributionType?: ContributionType;
  purpose?: string;
  notes?: string;
}): Promise<PaymentRecord> {
  const cleanUtr = data.utrNumber.trim().replace(/\s+/g, '');
  if (!cleanUtr || cleanUtr.length < 6) {
    throw new Error('Please enter a valid 12-digit UPI Reference / UTR Number.');
  }

  const payments = await getAllPayments();
  const existingUtr = payments.find(p => 
    p.utrNumber && 
    p.utrNumber.toLowerCase() === cleanUtr.toLowerCase() && 
    p.status !== 'REJECTED'
  );

  if (existingUtr) {
    throw new Error(`This UTR number (${cleanUtr}) has already been recorded for ${existingUtr.memberName}.`);
  }

  const isPublicSeva = data.contributionType === 'PUBLIC_SEVA';
  const members = await getAllMembers();
  let member = data.memberId ? members.find(m => m.id === data.memberId) : undefined;

  let memberName = '';
  let memberId = '';

  const currentDate = new Date();
  const month = data.month || (currentDate.getMonth() + 1);
  const year = data.year || currentDate.getFullYear();

  if (isPublicSeva) {
    memberName = (data.contributorName || member?.name || 'Public Contributor').trim();
    if (!memberName) throw new Error('Please provide your name for the public contribution receipt.');
    memberId = data.memberId || `guest_${Date.now()}`;
  } else {
    // Core Member Monthly Flow
    if (!data.memberId) throw new Error('Please select your name from the Core Members list.');
    member = members.find(m => m.id === data.memberId);
    if (!member) throw new Error('Member not found');
    memberName = member.name;
    memberId = member.id;

    // Check if month already paid or in review
    const existingMonthPayment = payments.find(p => 
      p.memberId === memberId && 
      p.month === month && 
      p.year === year && 
      (p.contributionType || 'CORE_MONTHLY') === 'CORE_MONTHLY' &&
      (p.status === 'VERIFIED' || p.status === 'PENDING_APPROVAL')
    );

    if (existingMonthPayment) {
      if (existingMonthPayment.status === 'VERIFIED') {
        throw new Error(`Payment for ${getMonthName(month)} ${year} is already recorded and verified!`);
      } else {
        throw new Error(`A payment for ${getMonthName(month)} ${year} is already pending admin verification.`);
      }
    }
  }

  const settings = await getSettings();
  const paymentRecord: PaymentRecord = {
    id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    memberId,
    memberName,
    month,
    year,
    amount: data.amount || (isPublicSeva ? 500 : settings.monthlyAmount),
    utrNumber: cleanUtr,
    method: 'UPI_QR',
    status: 'PENDING_APPROVAL',
    contributionType: isPublicSeva ? 'PUBLIC_SEVA' : 'CORE_MONTHLY',
    purpose: data.purpose || (isPublicSeva ? 'Community Welfare / Public Seva' : undefined),
    contributorPhone: data.contributorPhone,
    paidAt: new Date().toISOString(),
    notes: data.notes
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const paymentInsert: any = {
        id: paymentRecord.id,
        member_id: member ? member.id : (memberId && !memberId.startsWith('guest_') ? memberId : null),
        member_name: paymentRecord.memberName,
        month: paymentRecord.month,
        year: paymentRecord.year,
        amount: paymentRecord.amount,
        utr_number: paymentRecord.utrNumber,
        method: paymentRecord.method,
        status: paymentRecord.status,
        contribution_type: paymentRecord.contributionType,
        purpose: paymentRecord.purpose || null,
        contributor_phone: paymentRecord.contributorPhone || null,
        paid_at: paymentRecord.paidAt,
        notes: paymentRecord.notes || null
      };

      const { error } = await supabase.from('payments').insert(paymentInsert);
      if (error) {
        if (error.code === '42501' || error.message?.includes('row-level security')) {
          throw new Error('Supabase RLS Error: Row Level Security is blocking payment submission. Please run the SQL fix in Supabase SQL Editor.');
        }
        console.warn('Supabase submit payment error, retrying without extended columns:', error.message);
        delete paymentInsert.contribution_type;
        delete paymentInsert.purpose;
        delete paymentInsert.contributor_phone;
        if (error.message?.includes('foreign key') || error.message?.includes('violates foreign key')) {
          paymentInsert.member_id = null;
        }
        const retryRes = await supabase.from('payments').insert(paymentInsert);
        if (retryRes.error) {
          console.warn('Supabase submit payment retry failed, retrying with member_id=null:', retryRes.error.message);
          paymentInsert.member_id = null;
          const finalRetry = await supabase.from('payments').insert(paymentInsert);
          if (finalRetry.error) {
            if (finalRetry.error.code === '42501' || finalRetry.error.message?.includes('row-level security')) {
              throw new Error('Supabase RLS Error: Row Level Security is blocking payment submission. Please run the SQL fix in Supabase SQL Editor.');
            }
            throw new Error(`Database error saving payment: ${finalRetry.error.message}`);
          }
        }
      }
    } catch (e: any) {
      console.error('Supabase submit payment error:', e);
      throw e;
    }
  }

  const db = getDatabase();
  db.payments.push(paymentRecord);
  saveDatabase(db);
  return paymentRecord;
}

export async function logOfflinePayment(data: {
  memberId?: string;
  contributorName?: string;
  contributorPhone?: string;
  month?: number;
  year?: number;
  amount: number;
  method: PaymentMethod;
  contributionType?: ContributionType;
  purpose?: string;
  notes?: string;
  verifiedBy: string;
}): Promise<PaymentRecord> {
  const isPublicSeva = data.contributionType === 'PUBLIC_SEVA';
  const members = await getAllMembers();
  let member = data.memberId ? members.find(m => m.id === data.memberId) : undefined;

  let memberName = '';
  let memberId: string | undefined = data.memberId;
  const currentDate = new Date();
  const month = data.month || (currentDate.getMonth() + 1);
  const year = data.year || currentDate.getFullYear();

  if (isPublicSeva) {
    memberName = (data.contributorName || member?.name || 'Public Contributor').trim();
    memberId = member ? member.id : undefined;
  } else {
    if (member) {
      memberName = member.name;
      memberId = member.id;
    } else if (data.contributorName) {
      memberName = data.contributorName.trim();
      memberId = data.memberId;
    } else if (data.memberId) {
      const localDb = getDatabase();
      const localMember = localDb.members.find(m => m.id === data.memberId);
      if (localMember) {
        memberName = localMember.name;
        memberId = localMember.id;
      } else {
        throw new Error('Member not found. Please select a valid member.');
      }
    } else {
      throw new Error('Please select a member.');
    }

    const payments = await getAllPayments();
    if (memberId) {
      const existing = payments.find(p => 
        p.memberId === memberId && 
        p.month === month && 
        p.year === year && 
        (p.contributionType || 'CORE_MONTHLY') === 'CORE_MONTHLY' &&
        p.status === 'VERIFIED'
      );

      if (existing) {
        throw new Error(`Payment for ${getMonthName(month)} ${year} is already verified.`);
      }
    }
  }

  const settings = await getSettings();
  const paymentRecord: PaymentRecord = {
    id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    memberId: memberId || `guest_${Date.now()}`,
    memberName,
    month,
    year,
    amount: data.amount || (isPublicSeva ? 500 : settings.monthlyAmount),
    utrNumber: data.method === 'CASH' ? `CASH-${Date.now().toString().slice(-6)}` : undefined,
    method: data.method,
    status: 'VERIFIED',
    contributionType: isPublicSeva ? 'PUBLIC_SEVA' : 'CORE_MONTHLY',
    purpose: data.purpose || (isPublicSeva ? 'Community Welfare / Public Seva' : undefined),
    contributorPhone: data.contributorPhone,
    paidAt: new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
    verifiedBy: data.verifiedBy || 'Admin',
    notes: data.notes
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const paymentInsert: any = {
        id: paymentRecord.id,
        member_id: member ? member.id : (memberId && !memberId.startsWith('guest_') ? memberId : null),
        member_name: paymentRecord.memberName,
        month: paymentRecord.month,
        year: paymentRecord.year,
        amount: paymentRecord.amount,
        utr_number: paymentRecord.utrNumber || null,
        method: paymentRecord.method,
        status: paymentRecord.status,
        contribution_type: paymentRecord.contributionType,
        purpose: paymentRecord.purpose || null,
        contributor_phone: paymentRecord.contributorPhone || null,
        paid_at: paymentRecord.paidAt,
        verified_at: paymentRecord.verifiedAt,
        verified_by: paymentRecord.verifiedBy,
        notes: paymentRecord.notes || null
      };

      const { error } = await supabase.from('payments').insert(paymentInsert);
      if (error) {
        if (error.code === '42501' || error.message?.includes('row-level security')) {
          throw new Error('Supabase RLS Error: Row Level Security is blocking payment records. Please run the SQL fix in Supabase SQL Editor.');
        }
        console.warn('Supabase log offline payment error, retrying without extended columns:', error.message);
        delete paymentInsert.contribution_type;
        delete paymentInsert.purpose;
        delete paymentInsert.contributor_phone;
        if (error.message?.includes('foreign key') || error.message?.includes('violates foreign key')) {
          paymentInsert.member_id = null;
        }
        const retryRes = await supabase.from('payments').insert(paymentInsert);
        if (retryRes.error) {
          console.warn('Supabase payment insert retry failed, retrying with member_id=null:', retryRes.error.message);
          paymentInsert.member_id = null;
          const finalRetry = await supabase.from('payments').insert(paymentInsert);
          if (finalRetry.error) {
            if (finalRetry.error.code === '42501' || finalRetry.error.message?.includes('row-level security')) {
              throw new Error('Supabase RLS Error: Row Level Security is blocking payment records. Please run the SQL fix in Supabase SQL Editor.');
            }
            throw new Error(`Database error saving payment: ${finalRetry.error.message}`);
          }
        }
      }
    } catch (e: any) {
      console.error('Supabase log offline payment exception:', e);
      throw e;
    }
  }

  const db = getDatabase();
  db.payments.push(paymentRecord);
  saveDatabase(db);
  return paymentRecord;
}

export async function verifyPayment(
  paymentId: string, 
  action: 'APPROVE' | 'REJECT', 
  verifiedBy: string = 'Admin', 
  rejectionReason?: string
): Promise<PaymentRecord> {
  const verifiedAt = new Date().toISOString();
  const reason = rejectionReason || 'Payment could not be verified in bank statement.';

  if (isSupabaseConfigured && supabase) {
    const updatePayload = action === 'APPROVE' 
      ? { status: 'VERIFIED', verified_at: verifiedAt, verified_by: verifiedBy }
      : { status: 'REJECTED', rejection_reason: reason };
    const { error } = await supabase.from('payments').update(updatePayload).eq('id', paymentId);
    if (error) {
      if (error.code === '42501' || error.message?.includes('row-level security')) {
        throw new Error('Supabase RLS Error: Row Level Security is blocking payment verification. Please run the SQL fix in Supabase SQL Editor.');
      }
      throw new Error(`Database error verifying payment: ${error.message}`);
    }
  }

  const db = getDatabase();
  const payment = db.payments.find(p => p.id === paymentId);
  if (!payment) throw new Error('Payment record not found');

  if (action === 'APPROVE') {
    payment.status = 'VERIFIED';
    payment.verifiedAt = verifiedAt;
    payment.verifiedBy = verifiedBy;
  } else {
    payment.status = 'REJECTED';
    payment.rejectionReason = reason;
  }

  saveDatabase(db);
  return payment;
}

// ================= EXPENSE OPERATIONS =================
export async function getAllExpenses(): Promise<ExpenseRecord[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
      if (!error && Array.isArray(data)) {
        return data.map(e => ({
          id: e.id,
          title: e.title,
          category: e.category,
          amount: Number(e.amount),
          date: e.date,
          description: e.description || '',
          recordedBy: e.recorded_by || 'Admin',
          receiptNote: e.receipt_note || undefined
        }));
      }
    } catch (e) {
      console.error('Supabase get expenses error:', e);
    }
  }
  const db = getDatabase();
  return db.expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function addExpense(expenseData: Omit<ExpenseRecord, 'id'>): Promise<ExpenseRecord> {
  const newExpense: ExpenseRecord = {
    ...expenseData,
    id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('expenses').insert({
      id: newExpense.id,
      title: newExpense.title,
      category: newExpense.category,
      amount: newExpense.amount,
      date: newExpense.date,
      description: newExpense.description,
      recorded_by: newExpense.recordedBy,
      receipt_note: newExpense.receiptNote
    });
    if (error) {
      if (error.code === '42501' || error.message?.includes('row-level security')) {
        throw new Error('Supabase RLS Error: Row Level Security is blocking expense records. Please run the SQL fix in Supabase SQL Editor.');
      }
      throw new Error(`Database error adding expense: ${error.message}`);
    }
  }

  const db = getDatabase();
  db.expenses.push(newExpense);
  saveDatabase(db);
  return newExpense;
}

export async function deleteExpense(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      if (error.code === '42501' || error.message?.includes('row-level security')) {
        throw new Error('Supabase RLS Error: Row Level Security is blocking expense deletion. Please run the SQL fix in Supabase SQL Editor.');
      }
      throw new Error(`Database error deleting expense: ${error.message}`);
    }
  }

  const db = getDatabase();
  db.expenses = db.expenses.filter(e => e.id !== id);
  saveDatabase(db);
}

// ================= SETTINGS & STATS =================
export async function getSettings(): Promise<CommitteeSettings> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('committee_settings').select('*').limit(1).single();
      if (!error && data) {
        let adminName = data.admin_name;
        let adminPhone = data.admin_phone;

        if (!adminName) {
          try {
            const { data: adminMem } = await supabase.from('members').select('name, phone').eq('role', 'ADMIN').limit(1).single();
            if (adminMem?.name) adminName = adminMem.name;
            if (adminMem?.phone) adminPhone = adminMem.phone;
          } catch (mErr) {
            // ignore member fetch error
          }
        }

        return {
          committeeName: data.committee_name || DEFAULT_SETTINGS.committeeName,
          tagline: data.tagline || DEFAULT_SETTINGS.tagline,
          monthlyAmount: Number(data.monthly_amount) || 1000,
          upiId: data.upi_id || DEFAULT_SETTINGS.upiId,
          payeeName: data.payee_name || DEFAULT_SETTINGS.payeeName,
          adminName: adminName || DEFAULT_SETTINGS.adminName,
          adminPhone: adminPhone || DEFAULT_SETTINGS.adminPhone,
          adminPin: data.admin_pin || '1234',
          currency: data.currency || 'INR',
          startMonth: data.start_month || 1,
          startYear: data.start_year || 2026,
          reminderTemplateHindi: data.reminder_template_hindi,
          reminderTemplateEnglish: data.reminder_template_english
        };
      }
    } catch (e) {
      console.error('Supabase get settings error:', e);
    }
  }
  const db = getDatabase();
  const adminMem = db.members.find(m => m.role === 'ADMIN');
  return {
    ...DEFAULT_SETTINGS,
    ...db.settings,
    adminName: db.settings.adminName || adminMem?.name || DEFAULT_SETTINGS.adminName,
    adminPhone: db.settings.adminPhone || adminMem?.phone || DEFAULT_SETTINGS.adminPhone
  };
}

export async function updateSettings(updates: Partial<CommitteeSettings>, providedPin: string): Promise<CommitteeSettings> {
  const currentSettings = await getSettings();
  if (providedPin !== currentSettings.adminPin) {
    throw new Error('Unauthorized: Invalid Admin PIN');
  }

  if (isSupabaseConfigured && supabase) {
    const updatePayload: any = {};
    if (updates.committeeName !== undefined) updatePayload.committee_name = updates.committeeName;
    if (updates.tagline !== undefined) updatePayload.tagline = updates.tagline;
    if (updates.monthlyAmount !== undefined) updatePayload.monthly_amount = updates.monthlyAmount;
    if (updates.upiId !== undefined) updatePayload.upi_id = updates.upiId;
    if (updates.payeeName !== undefined) updatePayload.payee_name = updates.payeeName;
    if (updates.adminPin !== undefined) updatePayload.admin_pin = updates.adminPin;
    if (updates.adminName !== undefined) updatePayload.admin_name = updates.adminName;
    if (updates.adminPhone !== undefined) updatePayload.admin_phone = updates.adminPhone;
    if (updates.customQrUrl !== undefined) updatePayload.custom_qr_url = updates.customQrUrl;

    const { error } = await supabase.from('committee_settings').upsert({ id: 'default', ...updatePayload });
    if (error) {
      if (error.code === '42501' || error.message?.includes('row-level security')) {
        throw new Error('Supabase RLS Error: Row Level Security is blocking settings updates. Please run the SQL fix in Supabase SQL Editor.');
      }
      delete updatePayload.admin_name;
      delete updatePayload.admin_phone;
      delete updatePayload.custom_qr_url;
      const retry = await supabase.from('committee_settings').upsert({ id: 'default', ...updatePayload });
      if (retry.error) {
        throw new Error(`Database error saving settings: ${retry.error.message}`);
      }
    }

    if (updates.adminName || updates.adminPhone) {
      const memberPayload: any = {};
      if (updates.adminName) memberPayload.name = updates.adminName;
      if (updates.adminPhone) memberPayload.phone = updates.adminPhone;
      await supabase.from('members').update(memberPayload).eq('role', 'ADMIN');
    }
  }

  const db = getDatabase();
  db.settings = { ...db.settings, ...updates };

  if (updates.adminName || updates.adminPhone) {
    const adminMem = db.members.find(m => m.role === 'ADMIN');
    if (adminMem) {
      if (updates.adminName) adminMem.name = updates.adminName;
      if (updates.adminPhone) adminMem.phone = updates.adminPhone;
    }
  }

  saveDatabase(db);
  return db.settings;
}

export async function verifyAdminPin(pin: string): Promise<boolean> {
  const settings = await getSettings();
  return settings.adminPin === pin;
}

export async function getTreasurySummary(): Promise<TreasurySummary> {
  const settings = await getSettings();
  const payments = await getAllPayments();
  const expenses = await getAllExpenses();
  const members = await getAllMembers();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const verifiedPayments = payments.filter(p => p.status === 'VERIFIED');
  const totalCollected = verifiedPayments.reduce((sum, p) => sum + p.amount, 0);

  const coreCollected = verifiedPayments
    .filter(p => (p.contributionType || 'CORE_MONTHLY') === 'CORE_MONTHLY')
    .reduce((sum, p) => sum + p.amount, 0);

  const publicCollected = verifiedPayments
    .filter(p => p.contributionType === 'PUBLIC_SEVA')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalCollected - totalExpenses;

  const coreMembers = members.filter(m => m.status === 'ACTIVE' && m.memberType !== 'VOLUNTARY');
  const publicContributorsCount = new Set(
    verifiedPayments.filter(p => p.contributionType === 'PUBLIC_SEVA').map(p => p.memberName.toLowerCase().trim())
  ).size;

  const currentMonthPayments = payments.filter(
    p => p.month === currentMonth && 
         p.year === currentYear && 
         p.status === 'VERIFIED' &&
         (p.contributionType || 'CORE_MONTHLY') === 'CORE_MONTHLY'
  );
  const currentMonthCollections = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);
  const currentMonthTarget = coreMembers.length * settings.monthlyAmount;

  const paidMemberIds = new Set(currentMonthPayments.map(p => p.memberId));
  const currentMonthPendingCount = coreMembers.filter(m => !paidMemberIds.has(m.id)).length;
  const pendingApprovalsCount = payments.filter(p => p.status === 'PENDING_APPROVAL').length;

  return {
    totalCollected,
    coreCollected,
    publicCollected,
    totalExpenses,
    netBalance,
    totalMembers: members.length,
    activeMembers: members.filter(m => m.status === 'ACTIVE').length,
    coreMembersCount: coreMembers.length,
    publicContributorsCount,
    currentMonthCollections,
    currentMonthTarget,
    currentMonthPendingCount,
    pendingApprovalsCount
  };
}

export async function getPaymentMatrix(year: number): Promise<MemberMatrixRow[]> {
  const settings = await getSettings();
  const members = await getAllMembers();
  const payments = await getAllPayments();
  const coreMembers = members.filter(m => m.status === 'ACTIVE' && m.memberType !== 'VOLUNTARY');

  return coreMembers.map(member => {
    const memberPayments = payments.filter(
      p => p.memberId === member.id && 
           p.year === year &&
           (p.contributionType || 'CORE_MONTHLY') === 'CORE_MONTHLY'
    );
    
    let totalPaid = 0;
    let totalDue = 0;
    const monthsRecord: Record<number, any> = {};

    for (let m = 1; m <= 12; m++) {
      const monthPayment = memberPayments.find(p => p.month === m);
      const hasJoined = (member.joinedYear < year) || (member.joinedYear === year && member.joinedMonth <= m);

      if (!hasJoined) {
        monthsRecord[m] = {
          month: m,
          monthName: getMonthName(m),
          year,
          status: 'NOT_JOINED',
          amount: 0
        };
      } else if (monthPayment && monthPayment.status === 'VERIFIED') {
        totalPaid += monthPayment.amount;
        monthsRecord[m] = {
          month: m,
          monthName: getMonthName(m),
          year,
          status: 'PAID',
          payment: monthPayment,
          amount: monthPayment.amount
        };
      } else if (monthPayment && monthPayment.status === 'PENDING_APPROVAL') {
        monthsRecord[m] = {
          month: m,
          monthName: getMonthName(m),
          year,
          status: 'PENDING_APPROVAL',
          payment: monthPayment,
          amount: monthPayment.amount
        };
      } else {
        totalDue += settings.monthlyAmount;
        monthsRecord[m] = {
          month: m,
          monthName: getMonthName(m),
          year,
          status: 'DUE',
          amount: settings.monthlyAmount
        };
      }
    }

    return {
      member,
      totalPaid,
      totalDue,
      months: monthsRecord
    };
  });
}

export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || `Month ${month}`;
}

export async function resetToFreshStart(providedPin: string): Promise<void> {
  const settings = await getSettings();
  if (providedPin !== settings.adminPin) {
    throw new Error('Unauthorized: Invalid Admin PIN');
  }

  const adminName = settings.adminName || 'Narinder Singh';
  const adminPhone = settings.adminPhone || '9876543210';

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('payments').delete().neq('id', 'keep_none');
      await supabase.from('expenses').delete().neq('id', 'keep_none');
      await supabase.from('members').delete().neq('id', 'mem_1');
      await supabase.from('members').upsert({
        id: 'mem_1',
        name: adminName,
        phone: adminPhone,
        joined_month: 1,
        joined_year: 2026,
        status: 'ACTIVE',
        role: 'ADMIN',
        notes: 'Committee President / Organizer'
      });
      await supabase.from('committee_settings').update({
        admin_name: adminName,
        payee_name: adminName
      }).eq('id', 'default');
    } catch (e) {
      console.error('Supabase reset error:', e);
    }
  }

  const db = getDatabase();
  db.members = [
    {
      id: 'mem_1',
      name: adminName,
      phone: adminPhone,
      joinedMonth: 1,
      joinedYear: 2026,
      status: 'ACTIVE',
      role: 'ADMIN',
      notes: 'Committee President / Organizer'
    }
  ];
  db.payments = [];
  db.expenses = [];
  saveDatabase(db);
}
