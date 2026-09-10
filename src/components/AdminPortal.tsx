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
  ReceiptIndianRupee,
  Clock
} from 'lucide-react';
import { 
  Member, 
  PaymentRecord, 
  ExpenseRecord, 
  CommitteeSettings, 
  TreasurySummary, 
  ExpenseCategory 
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
  onRefreshData
}) => {
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
  const [newMemberNotes, setNewMemberNotes] = useState('');

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
  const [newAdminPin, setNewAdminPin] = useState('');

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
          verifiedBy: 'Father (Admin)'
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
          amount: offlineAmount,
          method: offlineMethod,
          notes: offlineNotes,
          adminPin,
          verifiedBy: 'Admin'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      confetti({ particleCount: 50, spread: 50 });
      setFeedbackMessage({ type: 'success', text: 'Offline payment verified and recorded!' });
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
          notes: newMemberNotes,
          adminPin
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedbackMessage({ type: 'success', text: `Member "${newMemberName}" added successfully!` });
      setNewMemberName('');
      setNewMemberPhone('');
      setNewMemberNotes('');
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

      setFeedbackMessage({ type: 'success', text: 'Expense recorded successfully!' });
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
        monthlyAmount: Number(settingsMonthlyAmount)
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

      setFeedbackMessage({ type: 'success', text: 'Settings updated successfully!' });
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

  // Calculate members pending for current month
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentMonthPaidMemberIds = new Set(
    payments
      .filter(p => p.month === currentMonth && p.year === currentYear && p.status === 'VERIFIED')
      .map(p => p.memberId)
  );
  const pendingMembers = members.filter(m => m.status === 'ACTIVE' && !currentMonthPaidMemberIds.has(m.id));

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
          { id: 'APPROVALS', label: `Pending Approvals (${pendingPayments.length})`, count: pendingPayments.length },
          { id: 'OFFLINE_PAY', label: 'Record Cash Payment' },
          { id: 'REMINDERS', label: `WhatsApp Reminders (${pendingMembers.length})` },
          { id: 'EXPENSE', label: 'Add Expense' },
          { id: 'MEMBERS', label: `Members Directory (${members.length})` },
          { id: 'SETTINGS', label: 'Settings & Backup' }
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
            Record Cash / Offline Payment
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Use this when an elder or member hands cash directly to your father. Instantly verifies and logs.
          </p>

          <form onSubmit={handleOfflinePaymentSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Member *</label>
              <select
                value={offlineMemberId}
                onChange={(e) => setOfflineMemberId(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.phone})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Month *</label>
                <select
                  value={offlineMonth}
                  onChange={(e) => setOfflineMonth(parseInt(e.target.value, 10))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                >
                  {MONTHS.map((m, idx) => (
                    <option key={m} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Year *</label>
                <select
                  value={offlineYear}
                  onChange={(e) => setOfflineYear(parseInt(e.target.value, 10))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                >
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  value={offlineAmount}
                  onChange={(e) => setOfflineAmount(Number(e.target.value))}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Method</label>
                <select
                  value={offlineMethod}
                  onChange={(e) => setOfflineMethod(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                >
                  <option value="CASH">Cash (In Hand)</option>
                  <option value="BANK_TRANSFER">Direct Bank NEFT/IMPS</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes / Remark</label>
              <input
                type="text"
                placeholder="e.g. Received cash during monthly colony meeting"
                value={offlineNotes}
                onChange={(e) => setOfflineNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? 'Logging...' : 'Verify & Credit Cash Payment (₹1,000)'}
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

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Role</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Co-Admin / Organizer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 302 / Shop 4"
                  value={newMemberNotes}
                  onChange={(e) => setNewMemberNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Adding...' : 'Add Member'}
              </button>
            </form>
          </div>

          {/* Members List */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between font-bold text-xs text-slate-700">
              <span>All Registered Members ({members.length})</span>
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
                        {member.status === 'INACTIVE' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-500 font-extrabold">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>{member.phone}</span>
                        {member.notes && <span>• {member.notes}</span>}
                      </div>
                    </div>
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
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Committee UPI ID (for QR codes) *</label>
                <input
                  type="text"
                  placeholder="e.g. yourname@okhdfcbank"
                  value={settingsUpiId}
                  onChange={(e) => setSettingsUpiId(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono font-bold"
                />
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
        </div>
      )}
    </div>
  );
};
