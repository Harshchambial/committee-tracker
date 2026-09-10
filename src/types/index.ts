export type PaymentStatus = 'VERIFIED' | 'PENDING_APPROVAL' | 'REJECTED';
export type PaymentMethod = 'UPI_QR' | 'CASH' | 'BANK_TRANSFER' | 'OTHER';

export type ExpenseCategory = 
  | 'EVENT'
  | 'CHARITY'
  | 'COMMUNITY_WELFARE'
  | 'DISBURSEMENT'
  | 'ADMINISTRATIVE'
  | 'MAINTENANCE'
  | 'OTHER';

export interface Member {
  id: string;
  name: string;
  phone: string;
  email?: string;
  joinedMonth: number; // 1-12
  joinedYear: number;
  status: 'ACTIVE' | 'INACTIVE';
  role: 'MEMBER' | 'ADMIN';
  notes?: string;
  pin?: string;
}

export interface PaymentRecord {
  id: string;
  memberId: string;
  memberName: string;
  month: number; // 1-12
  year: number; // e.g. 2026
  amount: number;
  utrNumber?: string;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: string; // ISO string
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface ExpenseRecord {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  description: string;
  recordedBy: string;
  receiptNote?: string;
}

export interface CommitteeSettings {
  committeeName: string;
  tagline: string;
  monthlyAmount: number; // e.g. 1000
  upiId: string; // e.g. father@upi
  payeeName: string; // Account holder name
  adminPin: string; // 4-6 digit PIN or password
  adminName?: string; // Admin / Organizer full name
  adminPhone?: string; // Admin contact phone
  currency: string;
  startMonth: number;
  startYear: number;
  reminderTemplateHindi?: string;
  reminderTemplateEnglish?: string;
}

export interface CommitteeDatabase {
  settings: CommitteeSettings;
  members: Member[];
  payments: PaymentRecord[];
  expenses: ExpenseRecord[];
}

export interface TreasurySummary {
  totalCollected: number;
  totalExpenses: number;
  netBalance: number;
  totalMembers: number;
  activeMembers: number;
  currentMonthCollections: number;
  currentMonthTarget: number;
  currentMonthPendingCount: number;
  pendingApprovalsCount: number;
}

export interface MemberMonthlyStatus {
  month: number;
  monthName: string;
  year: number;
  status: 'PAID' | 'PENDING_APPROVAL' | 'DUE' | 'NOT_JOINED';
  payment?: PaymentRecord;
  amount: number;
}

export interface MemberMatrixRow {
  member: Member;
  totalPaid: number;
  totalDue: number;
  months: Record<number, MemberMonthlyStatus>; // key is month 1-12
}

export interface AuthUser {
  id?: string;
  name: string;
  phone?: string;
  email?: string;
  role: 'ADMIN' | 'MEMBER';
}
