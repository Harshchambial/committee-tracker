'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  XCircle, 
  UserPlus, 
  IndianRupee, 
  Plus, 
  Settings, 
  Download, 
  MessageCircle, 
  AlertCircle, 
  Phone, 
  User, 
  Trash2,
  Edit3,
  ReceiptIndianRupee,
  Clock,
  HeartHandshake
} from 'lucide-react';
import { EditMemberModal } from '@/components/EditMemberModal';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Member, 
  PaymentRecord, 
  ExpenseRecord, 
  CommitteeSettings, 
  TreasurySummary, 
  ExpenseCategory,
  ContributionType 
} from '@/types';

interface AdminPortalProps {
  isAdminLoggedIn: boolean;
  onLoginSuccess: (pin: string) => void;
  onLogout: () => void;
  adminPin: string;
  members: Member[];
  payments: PaymentRecord[];
  expenses: ExpenseRecord[];
  settings: CommitteeSettings | null;
  summary: TreasurySummary | null;
  onRefreshData: () => void;
  onAdminProfileUpdated?: (updatedUser: import('@/types').AuthUser, newPin?: string) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isAdminLoggedIn,
  onLoginSuccess,
  onLogout,
  adminPin,
  members,
  payments,
  expenses,
  settings,
  summary,
  onRefreshData,
  onAdminProfileUpdated
}) => {
  const { isHindi, t, getMonthName } = useLanguage();

  // Login PIN state
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  // Active Admin Sub-tab
  const [adminTab, setAdminTab] = useState<'APPROVALS' | 'OFFLINE_PAY' | 'REMINDERS' | 'EXPENSE' | 'MEMBERS' | 'SETTINGS'>('APPROVALS');

  // Forms state
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Offline Payment form state
  const [offlineType, setOfflineType] = useState<ContributionType>('CORE_MONTHLY');
  const [offlinePurpose, setOfflinePurpose] = useState('सामान्य विकास एवं जन कल्याण');
  const [offlineMemberId, setOfflineMemberId] = useState(members[0]?.id || '');
  const [offlineMonth, setOfflineMonth] = useState(new Date().getMonth() + 1);
  const [offlineYear, setOfflineYear] = useState(new Date().getFullYear());
  const [offlineAmount, setOfflineAmount] = useState(settings?.monthlyAmount || 1000);
  const [offlineMethod, setOfflineMethod] = useState<'CASH' | 'BANK_TRANSFER'>('CASH');
  const [offlineNotes, setOfflineNotes] = useState('');

  // Add Member form state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [newMemberType, setNewMemberType] = useState<'CORE' | 'VOLUNTARY'>('CORE');
  const [newMemberNotes, setNewMemberNotes] = useState('');
  const [newMemberHasPaid, setNewMemberHasPaid] = useState(false);
  const [newMemberPaidMonth, setNewMemberPaidMonth] = useState(new Date().getMonth() + 1);
  const [newMemberPaidYear, setNewMemberPaidYear] = useState(new Date().getFullYear());
  const [newMemberPaidMethod, setNewMemberPaidMethod] = useState<'CASH' | 'UPI_QR'>('CASH');

  // Edit Member Modal state
  const [selectedMemberToEdit, setSelectedMemberToEdit] = useState<Member | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Add Expense form state
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('COMMUNITY_WELFARE');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseReceiptNote, setExpenseReceiptNote] = useState('');

  // Settings form state
  const [settingsCommitteeName, setSettingsCommitteeName] = useState(settings?.committeeName || '');
  const [settingsTagline, setSettingsTagline] = useState(settings?.tagline || '');
  const [settingsUpiId, setSettingsUpiId] = useState(settings?.upiId || '');
  const [settingsPayeeName, setSettingsPayeeName] = useState(settings?.payeeName || '');
  const [settingsMonthlyAmount, setSettingsMonthlyAmount] = useState(settings?.monthlyAmount || 1000);
  const [settingsAdminName, setSettingsAdminName] = useState(settings?.adminName || '');
  const [settingsAdminPhone, setSettingsAdminPhone] = useState(settings?.adminPhone || '');
  const [settingsCustomQrUrl, setSettingsCustomQrUrl] = useState(settings?.customQrUrl || '');
  const [newAdminPin, setNewAdminPin] = useState('');

  React.useEffect(() => {
    if (settings) {
      setSettingsCommitteeName(settings.committeeName || '');
      setSettingsTagline(settings.tagline || '');
      setSettingsUpiId(settings.upiId || '');
      setSettingsPayeeName(settings.payeeName || '');
      setSettingsMonthlyAmount(settings.monthlyAmount || 1000);
      setSettingsAdminName(settings.adminName || '');
      setSettingsAdminPhone(settings.adminPhone || '');
      setSettingsCustomQrUrl(settings.customQrUrl || '');
    }
  }, [settings]);

  // Pending approval payments
  const pendingPayments = payments.filter(p => p.status === 'PENDING_APPROVAL');

  // Handle Admin PIN Login
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsVerifyingPin(true);

    try {
      const res = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput.trim() })
      });
      const data = await res.json();
      if (data.valid) {
        onLoginSuccess(pinInput.trim());
      } else {
        setLoginError('Incorrect Admin PIN. Default PIN is 1234.');
      }
    } catch (err: any) {
      setLoginError('Authentication failed');
    } finally {
      setIsVerifyingPin(false);
    }
  };

  // 1-Click Payment Approval / Rejection
  const handleVerifyPayment = async (paymentId: string, action: 'APPROVE' | 'REJECT') => {
    setActionLoading(true);
    setFeedbackMessage(null);
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          action,
          adminPin,
          verifiedBy: settings?.adminName || 'Father (Admin)'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (action === 'APPROVE') {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      }

      setFeedbackMessage({
        type: 'success',
        text: action === 'APPROVE' ? 'Payment verified and added to Treasury!' : 'Payment rejected.'
      });
      onRefreshData();
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Offline Cash Payment
  const handleOfflinePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedbackMessage(null);

    try {
      const res = await fetch('/api/payments/offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: offlineMemberId,
          month: offlineMonth,
          year: offlineYear,
          amount: Number(offlineAmount),
          method: offlineMethod,
          notes: offlineNotes,
          contributionType: offlineType,
          purpose: offlineType === 'PUBLIC_SEVA' ? offlinePurpose : undefined,
          adminPin,
          verifiedBy: settings?.adminName || 'Admin'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      confetti({ particleCount: 50, spread: 50 });
      setFeedbackMessage({ 
        type: 'success', 
        text: isHindi ? 'नकद भुगतान सत्यापित एवं कोष में दर्ज हो गया!' : 'Offline payment verified and recorded!' 
      });
      setOfflineNotes('');
      onRefreshData();
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Add Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedbackMessage(null);

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMemberName,
          phone: newMemberPhone,
          role: newMemberRole,
          memberType: newMemberType,
          notes: newMemberNotes,
          adminPin,
          hasPaid: newMemberHasPaid,
          paidMonth: newMemberPaidMonth,
          paidYear: newMemberPaidYear,
          paidMethod: newMemberPaidMethod,
          paidAmount: newMemberType === 'CORE' ? (settings?.monthlyAmount || 1000) : 1000
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (newMemberHasPaid) {
        confetti({ particleCount: 60, spread: 60 });
      }

      setFeedbackMessage({ 
        type: 'success', 
        text: data.message || (isHindi ? `सदस्य "${newMemberName}" सफलतापूर्वक जोड़ दिया गया!` : `Member "${newMemberName}" added successfully!`)
      });
      setNewMemberName('');
      setNewMemberPhone('');
      setNewMemberNotes('');
      setNewMemberHasPaid(false);
      onRefreshData();
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Member
  const handleDeleteMember = async (memberId: string, memberName: string) => {
    const confirmMsg = isHindi 
      ? `क्या आप वाकई "${memberName}" को हटाना चाहते हैं? इनसे जुड़े सभी रिकॉर्ड भी हट जाएंगे।` 
      : `Are you sure you want to permanently delete "${memberName}"? All contributions linked to this member will also be deleted.`;
    if (!confirm(confirmMsg)) {
      return;
    }
    setActionLoading(true);
    setFeedbackMessage(null);

    try {
      const res = await fetch(`/api/members?id=${memberId}&adminPin=${adminPin}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedbackMessage({ 
        type: 'success', 
        text: isHindi ? `सदस्य "${memberName}" सफलतापूर्वक हटा दिया गया।` : `Member "${memberName}" deleted successfully.` 
      });
      onRefreshData();
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Reset / Wipe Dummy Test Data
  const handleResetDummyData = async () => {
    const confirmMsg = isHindi
      ? "⚠️ चेतावनी: इससे सभी नमूना सदस्य, परीक्षण भुगतान और डमी खर्च हट जाएंगे। केवल व्यवस्थापक खाता सुरक्षित रहेगा। क्या आप सुनिश्चित हैं?"
      : "⚠️ CAUTION: This will wipe all test payments, dummy members, and demo expenses, leaving only your father as Admin. Are you sure you want to start fresh?";
    if (!confirm(confirmMsg)) {
      return;
    }
    setActionLoading(true);
    setFeedbackMessage(null);

    try {
      const res = await fetch('/api/admin/reset-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPin })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      confetti({ particleCount: 70, spread: 70 });
      setFeedbackMessage({ type: 'success', text: data.message });
      onRefreshData();
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Add Expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedbackMessage(null);

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: expenseTitle,
          category: expenseCategory,
          amount: parseFloat(expenseAmount),
          date: expenseDate,
          description: expenseDesc,
          receiptNote: expenseReceiptNote,
          adminPin
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedbackMessage({ 
        type: 'success', 
        text: isHindi ? 'व्यय सफलतापूर्वक दर्ज किया गया!' : 'Expense recorded successfully!' 
      });
      setExpenseTitle('');
      setExpenseAmount('');
      setExpenseDesc('');
      setExpenseReceiptNote('');
      onRefreshData();
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Update Settings
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedbackMessage(null);

    try {
      const updates: any = {
        committeeName: settingsCommitteeName,
        tagline: settingsTagline,
        upiId: settingsUpiId,
        payeeName: settingsPayeeName,
        adminName: settingsAdminName.trim(),
        adminPhone: settingsAdminPhone.trim(),
        monthlyAmount: Number(settingsMonthlyAmount),
        customQrUrl: settingsCustomQrUrl.trim()
      };
      if (newAdminPin && newAdminPin.trim().length >= 4) {
        updates.adminPin = newAdminPin.trim();
      }

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPin, updates })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedbackMessage({ 
        type: 'success', 
        text: isHindi ? 'सेटिंग्स सफलतापूर्वक सहेजी गईं!' : 'Settings updated successfully!' 
      });
      if (onAdminProfileUpdated) {
        onAdminProfileUpdated({
          name: settingsAdminName.trim() || 'Admin',
          phone: settingsAdminPhone.trim(),
          role: 'ADMIN'
        }, updates.adminPin);
      }
      onRefreshData();
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Download Backup
  const handleDownloadBackup = () => {
    window.location.href = `/api/backup?adminPin=${adminPin}`;
  };

  // Calculate members pending for current month (ONLY CORE MEMBERS)
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentMonthPaidMemberIds = new Set(
    payments
      .filter(p => p.month === currentMonth && p.year === currentYear && p.status === 'VERIFIED')
      .map(p => p.memberId)
  );
  const pendingMembers = members.filter(m => m.status === 'ACTIVE' && m.memberType !== 'VOLUNTARY' && !currentMonthPaidMemberIds.has(m.id));

  // If Not Logged In, Show PIN Keypad/Form
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Admin Authentication</h2>
        <p className="text-xs text-slate-500 mt-1">
          Enter your 4-digit Committee Admin PIN to manage payments, approve UTRs, and update settings.
        </p>

        <form onSubmit={handlePinSubmit} className="mt-6 space-y-4">
          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {loginError}
            </div>
          )}

          <div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter PIN (Default: 1234)"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              required
              className="w-full text-center text-2xl tracking-[0.5em] font-mono font-black py-3 rounded-2xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifyingPin || !pinInput}
            className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md shadow-amber-600/20 transition cursor-pointer disabled:opacity-50"
          >
            {isVerifyingPin ? 'Verifying...' : 'Unlock Admin Panel'}
          </button>
        </form>

        <div className="mt-6 text-[11px] text-slate-400 border-t border-slate-100 pt-4">
          Default Admin PIN for new installation: <strong className="text-slate-600 font-mono">1234</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Header Bar */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Mode Active
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Committee Administration Portal
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Logged in as Committee Treasurer / Organizer. All actions reflect live immediately.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            Lock Panel
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
        {[
          { 
            id: 'APPROVALS', 
            label: isHindi ? `स्वीकृति प्रतीक्षारत (${pendingPayments.length})` : `Pending Approvals (${pendingPayments.length})`, 
            count: pendingPayments.length 
          },
          { 
            id: 'OFFLINE_PAY', 
            label: isHindi ? 'नकद भुगतान दर्ज करें' : 'Record Cash Payment' 
          },
          { 
            id: 'REMINDERS', 
            label: isHindi ? `व्हाट्सएप स्मरण (${pendingMembers.length})` : `WhatsApp Reminders (${pendingMembers.length})` 
          },
          { 
            id: 'EXPENSE', 
            label: isHindi ? 'खर्च जोड़ें' : 'Add Expense' 
          },
          { 
            id: 'MEMBERS', 
            label: isHindi ? `सदस्य सूची (${members.length})` : `Members Directory (${members.length})` 
          },
          { 
            id: 'SETTINGS', 
            label: isHindi ? 'सेटिंग्स एवं बैकअप' : 'Settings & Backup' 
          }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setAdminTab(tab.id as any);
              setFeedbackMessage(null);
            }}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
              adminTab === tab.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-black">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between ${
          feedbackMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{feedbackMessage.text}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* TAB 1: PENDING UTR APPROVALS */}
      {adminTab === 'APPROVALS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                Pending Payment Approvals Queue
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Check member UTR against your bank statement (GPay / PhonePe / Bank SMS) and tap Approve.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {pendingPayments.length} Waiting
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingPayments.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mx-auto mb-2" />
                No pending payments waiting for approval! Everything is up to date.
              </div>
            ) : (
              pendingPayments.map(payment => (
                <div key={payment.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{payment.memberName}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
                        {MONTHS[payment.month - 1]} {payment.year}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-extrabold text-[11px] border border-emerald-200">
                        ₹{payment.amount}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="font-mono bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md font-bold border border-amber-200">
                        UTR: {payment.utrNumber}
                      </span>
                      <span>Submitted: {new Date(payment.paidAt).toLocaleDateString()} at {new Date(payment.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {payment.notes && (
                      <p className="text-xs text-slate-600 italic bg-slate-100/70 p-2 rounded-lg mt-1">
                        &quot;{payment.notes}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleVerifyPayment(payment.id, 'APPROVE')}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve & Credit
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Enter rejection reason (or leave empty):', 'UTR not found in bank statement');
                        if (reason !== null) {
                          handleVerifyPayment(payment.id, 'REJECT');
                        }
                      }}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-semibold text-xs border border-slate-200 transition cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RECORD OFFLINE CASH PAYMENT */}
      {adminTab === 'OFFLINE_PAY' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs max-w-xl">
          <h3 className="font-extrabold text-slate-900 text-base mb-1">
            {isHindi ? 'नकद / ऑफलाइन भुगतान दर्ज करें' : 'Record Cash / Offline Payment'}
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            {isHindi 
              ? 'जब कोई सदस्य या नागरिक सीधे नकद राशि सौंपते हैं, तो उसे यहाँ तुरंत सत्यापित कर कोष में जोड़ें।'
              : 'Use this when a member or citizen hands cash directly. Instantly verifies and logs.'}
          </p>

          {/* Type Switcher */}
          <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setOfflineType('CORE_MONTHLY');
                setOfflineAmount(settings?.monthlyAmount || 1000);
              }}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                offlineType === 'CORE_MONTHLY'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>⭐</span>
              <span>{isHindi ? 'कोर मासिक (₹1,000)' : 'Core Monthly (₹1,000)'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setOfflineType('PUBLIC_SEVA');
                setOfflineAmount(500);
              }}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                offlineType === 'PUBLIC_SEVA'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🤝</span>
              <span>{isHindi ? 'जन सहयोग (खुला कोष)' : 'Jan Sahayog (Public)'}</span>
            </button>
          </div>

          <form onSubmit={handleOfflinePaymentSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {isHindi ? 'सदस्य / योगदानकर्ता *' : 'Member / Contributor *'}
              </label>
              <select
                value={offlineMemberId}
                onChange={(e) => setOfflineMemberId(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium bg-white"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.phone}) {m.memberType === 'VOLUNTARY' ? '• Jan Sahayog' : '• Core'}
                  </option>
                ))}
              </select>
            </div>

            {offlineType === 'CORE_MONTHLY' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {isHindi ? 'माह *' : 'Month *'}
                  </label>
                  <select
                    value={offlineMonth}
                    onChange={(e) => setOfflineMonth(parseInt(e.target.value, 10))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>{getMonthName(m)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {isHindi ? 'वर्ष *' : 'Year *'}
                  </label>
                  <select
                    value={offlineYear}
                    onChange={(e) => setOfflineYear(parseInt(e.target.value, 10))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white"
                  >
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {isHindi ? 'सहयोग का उद्देश्य / कार्य *' : 'Purpose / Cause *'}
                </label>
                <select
                  value={offlinePurpose}
                  onChange={(e) => setOfflinePurpose(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white font-medium mb-1.5"
                >
                  <option value="सामान्य विकास एवं जन कल्याण">{isHindi ? 'सामान्य विकास एवं जन कल्याण' : 'General Welfare & Development'}</option>
                  <option value="मंदिर निर्माण एवं उत्सव">{isHindi ? 'मंदिर निर्माण एवं उत्सव' : 'Temple Construction & Festivals'}</option>
                  <option value="पार्क एवं वृक्षारोपण">{isHindi ? 'पार्क एवं वृक्षारोपण' : 'Park & Greenery Maintenance'}</option>
                  <option value="मार्ग प्रकाश (स्ट्रीट लाइट्स)">{isHindi ? 'मार्ग प्रकाश (स्ट्रीट लाइट्स)' : 'Street Lighting & Security'}</option>
                  <option value="स्वच्छता एवं जल निकास">{isHindi ? 'स्वच्छता एवं जल निकास' : 'Cleanliness & Drainage'}</option>
                  <option value="विशिष्ट सार्वजनिक कार्य">{isHindi ? 'विशिष्ट सार्वजनिक कार्य' : 'Specific Public Work'}</option>
                </select>
                <input
                  type="text"
                  placeholder={isHindi ? 'या विशिष्ट उद्देश्य लिखें...' : 'Or enter custom cause...'}
                  value={offlinePurpose}
                  onChange={(e) => setOfflinePurpose(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {isHindi ? 'राशि (₹) *' : 'Amount (₹) *'}
                </label>
                <input
                  type="number"
                  value={offlineAmount}
                  onChange={(e) => setOfflineAmount(Number(e.target.value))}
                  required
                  min={1}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-black text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {isHindi ? 'भुगतान विधि' : 'Payment Method'}
                </label>
                <select
                  value={offlineMethod}
                  onChange={(e) => setOfflineMethod(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white"
                >
                  <option value="CASH">{isHindi ? 'नकद (हाथ में)' : 'Cash (In Hand)'}</option>
                  <option value="BANK_TRANSFER">{isHindi ? 'बैंक ट्रांसफर / चेक' : 'Bank Transfer / Cheque'}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {isHindi ? 'टिप्पणी / विवरण (वैकल्पिक)' : 'Notes / Remarks (Optional)'}
              </label>
              <input
                type="text"
                placeholder={isHindi ? 'जैसे: मासिक बैठक में नकद प्राप्त हुआ' : 'e.g. Received cash during monthly colony meeting'}
                value={offlineNotes}
                onChange={(e) => setOfflineNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className={`w-full py-3 rounded-xl text-white font-black text-xs shadow-md transition cursor-pointer disabled:opacity-50 ${
                offlineType === 'CORE_MONTHLY'
                  ? 'bg-slate-900 hover:bg-slate-800'
                  : 'bg-indigo-900 hover:bg-indigo-800'
              }`}
            >
              {actionLoading 
                ? (isHindi ? 'सत्यापित हो रहा है...' : 'Logging...') 
                : (isHindi 
                    ? `सत्यापित करें एवं ₹${offlineAmount} कोष में जोड़ें` 
                    : `Verify & Credit Cash (₹${offlineAmount})`)}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: WHATSAPP REMINDERS */}
      {adminTab === 'REMINDERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                1-Click WhatsApp Reminders ({MONTHS[currentMonth - 1]} {currentYear})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click &quot;Send Reminder&quot; to open WhatsApp with a pre-formatted polite message.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              {pendingMembers.length} Members Pending
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingMembers.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                All members have paid for {MONTHS[currentMonth - 1]}! No reminders needed.
              </div>
            ) : (
              pendingMembers.map(member => {
                const phone = member.phone.replace(/\D/g, '');
                const cleanPhone = phone.startsWith('91') ? phone : `91${phone}`;
                const text = encodeURIComponent(
                  `नमस्ते ${member.name} जी,\n` +
                  `${settings?.committeeName || 'समिति'} का ${MONTHS[currentMonth - 1]} ${currentYear} का ₹${settings?.monthlyAmount || 1000} अंशदान अभी बकाया है।\n` +
                  `कृपया समिति पोर्टल से UPI द्वारा भुगतान कर UTR नंबर सबमिट करें।\n` +
                  `धन्यवाद! 🙏`
                );

                return (
                  <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{member.name}</div>
                        <div className="text-xs text-slate-500">{member.phone}</div>
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/${cleanPhone}?text=${text}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Send WhatsApp
                    </a>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ADD EXPENSE */}
      {adminTab === 'EXPENSE' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs max-w-xl">
          <h3 className="font-extrabold text-slate-900 text-base mb-1">
            Log New Fund Utilization / Expense
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Record every expenditure to maintain transparency with all committee members.
          </p>

          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Expense Title *</label>
              <input
                type="text"
                placeholder="e.g. Monthly General Meeting Snacks & Tea"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category *</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                >
                  <option value="COMMUNITY_WELFARE">Community Welfare</option>
                  <option value="EVENT">Event & Meeting</option>
                  <option value="CHARITY">Charity & Donation</option>
                  <option value="DISBURSEMENT">Member Loan / Disbursement</option>
                  <option value="ADMINISTRATIVE">Admin & Stationery</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date *</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Receipt / Bill Voucher</label>
                <input
                  type="text"
                  placeholder="e.g. Bill No. 441 / Cash memo"
                  value={expenseReceiptNote}
                  onChange={(e) => setExpenseReceiptNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description / Purpose</label>
              <textarea
                rows={2}
                placeholder="Details of the expenditure for committee records..."
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? 'Recording...' : 'Record Expense & Deduct from Treasury'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: MEMBERS DIRECTORY */}
      {adminTab === 'MEMBERS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Member Form */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs h-fit">
            <h3 className="font-extrabold text-slate-900 text-base mb-1 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              Add New Member
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Scale committee from 10 to 100+ members easily.
            </p>

            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Narendra Verma"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number (10 Digits) *</label>
                <input
                  type="tel"
                  placeholder="e.g. 9812345678"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                />
              </div>

              {/* Membership Category: Core vs Public */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {isHindi ? 'सदस्यता प्रकार (योगदान श्रेणी) *' : 'Membership Category *'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewMemberType('CORE')}
                    className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col ${
                      newMemberType === 'CORE'
                        ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500/30 text-emerald-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-black">⭐ {isHindi ? 'कोर सदस्य' : 'Core Member'}</span>
                    <span className="text-[10px] text-slate-500">{isHindi ? '₹1,000 / माह' : '₹1,000 / mo'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewMemberType('VOLUNTARY')}
                    className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col ${
                      newMemberType === 'VOLUNTARY'
                        ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500/30 text-indigo-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-black">🤝 {isHindi ? 'जन सहयोग' : 'Public'}</span>
                    <span className="text-[10px] text-slate-500">{isHindi ? 'ऐच्छिक दान' : 'Voluntary'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {isHindi ? 'भूमिका (Role)' : 'Role'}
                </label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white"
                >
                  <option value="MEMBER">{isHindi ? 'सदस्य' : 'Member'}</option>
                  <option value="ADMIN">{isHindi ? 'सह-व्यवस्थापक (Co-Admin)' : 'Co-Admin / Organizer'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {isHindi ? 'टिप्पणी / पता (वैकल्पिक)' : 'Notes / Address (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={isHindi ? 'जैसे: मकान 302 / दुकान 4' : 'e.g. Flat 302 / Shop 4'}
                  value={newMemberNotes}
                  onChange={(e) => setNewMemberNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                />
              </div>

              {/* Initial Contribution Payment Option */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newMemberHasPaid}
                    onChange={(e) => setNewMemberHasPaid(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-emerald-900">
                    {isHindi ? 'क्या सदस्य ने प्रारंभिक अंशदान का भुगतान कर दिया है?' : 'Has this member already paid initial contribution?'}
                  </span>
                </label>

                {newMemberHasPaid && (
                  <div className="space-y-2 pt-2 border-t border-emerald-200/70 animate-in fade-in duration-150">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-800 uppercase mb-0.5">
                          {isHindi ? 'माह' : 'Month'}
                        </label>
                        <select
                          value={newMemberPaidMonth}
                          onChange={(e) => setNewMemberPaidMonth(Number(e.target.value))}
                          className="w-full p-2 bg-white rounded-lg border border-emerald-300 text-xs font-bold"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                            <option key={m} value={m}>{getMonthName(m)}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-emerald-800 uppercase mb-0.5">
                          {isHindi ? 'विधि' : 'Method'}
                        </label>
                        <select
                          value={newMemberPaidMethod}
                          onChange={(e) => setNewMemberPaidMethod(e.target.value as any)}
                          className="w-full p-2 bg-white rounded-lg border border-emerald-300 text-xs font-bold"
                        >
                          <option value="CASH">{isHindi ? 'नकद' : 'Cash in Hand'}</option>
                          <option value="UPI_QR">{isHindi ? 'UPI / ऑनलाइन' : 'UPI / Online'}</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-emerald-700 font-semibold px-1">
                      <span>{isHindi ? 'राशि:' : 'Amount:'} ₹{newMemberType === 'CORE' ? (settings?.monthlyAmount || 1000) : 1000}</span>
                      <span className="text-emerald-800 font-bold">{isHindi ? 'स्वतः सत्यापित ✓' : 'Auto-Verified ✓'}</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
              >
                {actionLoading 
                  ? (isHindi ? 'जोड़ा जा रहा है...' : 'Adding...') 
                  : (newMemberHasPaid 
                      ? (isHindi ? 'सदस्य जोड़ें एवं भुगतान दर्ज करें' : 'Add Member & Record Payment') 
                      : (isHindi ? 'सदस्य जोड़ें' : 'Add Member'))}
              </button>
            </form>
          </div>

          {/* Members List */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between font-bold text-xs text-slate-700">
              <span>{isHindi ? `सभी पंजीकृत सदस्य (${members.length})` : `All Registered Members (${members.length})`}</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {members.map(member => (
                <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-xs">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <span>{member.name}</span>
                        {member.role === 'ADMIN' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 font-extrabold">
                            Admin
                          </span>
                        )}
                        {member.memberType === 'VOLUNTARY' ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-200">
                            {isHindi ? '🤝 जन सहयोग' : '🤝 Public'}
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200">
                            {isHindi ? '⭐ कोर सदस्य' : '⭐ Core (₹1k)'}
                          </span>
                        )}
                        {member.status === 'INACTIVE' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-500 font-extrabold">
                            {isHindi ? 'निष्क्रिय' : 'Inactive'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>{member.phone}</span>
                        {member.notes && <span>• {member.notes}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Member Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMemberToEdit(member);
                        setIsEditModalOpen(true);
                      }}
                      className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                      title={`Edit ${member.name}`}
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteMember(member.id, member.name)}
                      className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                      title={`Delete ${member.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SETTINGS & BACKUP */}
      {adminTab === 'SETTINGS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings Form */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="font-extrabold text-slate-900 text-base mb-1 flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-700" />
              Committee & UPI Configuration
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Change the UPI ID for QR code generation and monthly contribution amount.
            </p>

            <form onSubmit={handleUpdateSettings} className="space-y-4">
              {/* Admin Identity Box */}
              <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 uppercase">
                  <User className="w-4 h-4 text-amber-700" />
                  <span>Admin Identity & Details</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Admin / Organizer Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Narinder Singh"
                    value={settingsAdminName}
                    onChange={(e) => setSettingsAdminName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-bold text-slate-900"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Your father&apos;s name will appear on the top header, login welcome, and receipts.
                  </p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Admin Mobile Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={settingsAdminPhone}
                    onChange={(e) => setSettingsAdminPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Committee Name</label>
                <input
                  type="text"
                  value={settingsCommitteeName}
                  onChange={(e) => setSettingsCommitteeName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {isHindi ? 'समिति UPI ID (QR कोड हेतु) *' : 'Committee UPI ID (for QR codes) *'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. yourname@okhdfcbank"
                  value={settingsUpiId}
                  onChange={(e) => setSettingsUpiId(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {isHindi ? 'कस्टम UPI QR कोड इमेज लिंक (वैकल्पिक)' : 'Custom UPI QR Image URL (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://... or /qr-code.png"
                  value={settingsCustomQrUrl}
                  onChange={(e) => setSettingsCustomQrUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {isHindi 
                    ? 'यदि आपके पास बैंक या Google Pay / PhonePe का मुद्रित QR कोड है, तो उसका लिंक यहाँ दर्ज करें।' 
                    : 'If you have a printed bank QR code image, paste the image link here. Leave blank for auto-generated QR.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payee Name</label>
                  <input
                    type="text"
                    value={settingsPayeeName}
                    onChange={(e) => setSettingsPayeeName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Monthly Amount (₹)</label>
                  <input
                    type="number"
                    value={settingsMonthlyAmount}
                    onChange={(e) => setSettingsMonthlyAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Change Admin PIN (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave empty to keep current PIN"
                  value={newAdminPin}
                  onChange={(e) => setNewAdminPin(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Save Settings
              </button>
            </form>
          </div>

          {/* Backup & Export Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base mb-1 flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-600" />
                Data Security & Offline Backup
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Download a complete offline JSON backup of all members, payments, receipts, and expenses with 1 click anytime.
              </p>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span>Total Members:</span>
                  <span className="font-bold text-slate-900">{members.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Payment Records:</span>
                  <span className="font-bold text-slate-900">{payments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Expense Records:</span>
                  <span className="font-bold text-slate-900">{expenses.length}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleDownloadBackup}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Complete JSON Backup
              </button>
              <p className="text-[11px] text-slate-400 text-center">
                Keep this file saved on your father&apos;s phone or Google Drive for 100% peace of mind.
              </p>
            </div>
          </div>

          {/* Danger Zone: Wipe Test Data */}
          <div className="lg:col-span-2 bg-rose-50/70 rounded-2xl p-5 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-extrabold text-rose-900 text-sm flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Wipe Dummy Test Data (Clean Slate)</span>
              </h4>
              <p className="text-xs text-rose-700 max-w-xl">
                Delete all sample members (Sunil, Ramesh, Anil, etc.), test payments, and demo expenses with 1 click. Keeps your father (<strong>{settings?.adminName || 'Narinder Singh'}</strong>) as sole Admin.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetDummyData}
              disabled={actionLoading}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition cursor-pointer shrink-0 disabled:opacity-50"
            >
              {actionLoading ? 'Cleaning...' : 'Wipe All Test Data Now'}
            </button>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMemberToEdit(null);
        }}
        member={selectedMemberToEdit}
        adminPin={adminPin}
        onMemberUpdated={onRefreshData}
      />
    </div>
  );
};
