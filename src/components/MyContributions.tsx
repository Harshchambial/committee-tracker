'use client';

import React, { useState } from 'react';
import { 
  User, 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Receipt, 
  QrCode, 
  Calendar,
  Phone,
  ShieldCheck
} from 'lucide-react';
import { Member, PaymentRecord, CommitteeSettings } from '@/types';

interface MyContributionsProps {
  members: Member[];
  payments: PaymentRecord[];
  settings: CommitteeSettings | null;
  onPayDues: (memberId: string, month: number, year: number) => void;
  onViewReceipt: (payment: PaymentRecord) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MyContributions: React.FC<MyContributionsProps> = ({
  members,
  payments,
  settings,
  onPayDues,
  onViewReceipt
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [searchPhone, setSearchPhone] = useState<string>('');

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // If user typed a phone number, attempt to match
  const handlePhoneSearch = (phone: string) => {
    setSearchPhone(phone);
    const clean = phone.trim();
    if (clean.length >= 4) {
      const match = members.find(m => m.phone.includes(clean));
      if (match) setSelectedMemberId(match.id);
    }
  };

  const selectedMember = members.find(m => m.id === selectedMemberId);
  const memberPayments = payments.filter(p => p.memberId === selectedMemberId);

  const totalPaid = memberPayments
    .filter(p => p.status === 'VERIFIED')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingApprovals = memberPayments.filter(p => p.status === 'PENDING_APPROVAL');

  // Check current year months
  const monthlyStatusList = MONTHS.map((monthName, idx) => {
    const monthNum = idx + 1;
    const payment = memberPayments.find(p => p.month === monthNum && p.year === currentYear);
    return {
      monthNum,
      monthName,
      payment,
      isCurrentMonth: monthNum === currentMonth
    };
  });

  return (
    <div className="space-y-6">
      {/* Selector Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="max-w-xl">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            Member Self-Service Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Select your name or enter your phone number to check your personal payment history and download receipts.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Select Your Name
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Or Search by Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter phone number..."
                  value={searchPhone}
                  onChange={(e) => handlePhoneSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedMember && (
        <div className="space-y-6">
          {/* Member Profile & Lifetime Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-tr from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-md flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-black">
                {selectedMember.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-extrabold">{selectedMember.name}</h3>
                <p className="text-xs text-emerald-100">{selectedMember.phone}</p>
                <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold bg-white/15 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  Active Committee Member
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Lifetime Total Contributed
              </span>
              <div className="text-3xl font-black text-slate-900 mt-2 flex items-center text-emerald-600">
                <IndianRupee className="w-6 h-6 stroke-[2.5]" />
                {totalPaid.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {memberPayments.filter(p => p.status === 'VERIFIED').length} Monthly installments verified
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Current {currentYear} Status
              </span>
              <div className="mt-2">
                {monthlyStatusList[currentMonth - 1]?.payment?.status === 'VERIFIED' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold text-sm border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Up-to-Date for {MONTHS[currentMonth - 1]}
                  </span>
                ) : monthlyStatusList[currentMonth - 1]?.payment?.status === 'PENDING_APPROVAL' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 font-extrabold text-sm border border-amber-200">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Under Verification
                  </span>
                ) : (
                  <button
                    onClick={() => onPayDues(selectedMember.id, currentMonth, currentYear)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    Pay {MONTHS[currentMonth - 1]} (₹{settings?.monthlyAmount || 1000})
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Monthly commitment: ₹{settings?.monthlyAmount || 1000}/mo
              </p>
            </div>
          </div>

          {/* Monthly Payment Records Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                {currentYear} Monthly Payments Breakdown
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {monthlyStatusList.map(({ monthNum, monthName, payment, isCurrentMonth }) => {
                const isPaid = payment?.status === 'VERIFIED';
                const isPending = payment?.status === 'PENDING_APPROVAL';

                return (
                  <div 
                    key={monthNum}
                    className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCurrentMonth ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isPaid 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : isPending 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {monthNum}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                          <span>{monthName} {currentYear}</span>
                          {isCurrentMonth && (
                            <span className="text-[10px] uppercase font-extrabold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                              Current
                            </span>
                          )}
                        </div>
                        {payment && (
                          <div className="text-xs text-slate-500 font-mono mt-0.5">
                            {payment.utrNumber ? `UTR: ${payment.utrNumber}` : 'Payment recorded'}
                            {payment.paidAt && ` • ${new Date(payment.paidAt).toLocaleDateString()}`}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {isPaid && (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Verified ₹{payment.amount}
                          </span>
                          <button
                            onClick={() => onViewReceipt(payment)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
                            title="View / Download digital receipt"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            Receipt
                          </button>
                        </div>
                      )}

                      {isPending && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                          Awaiting Admin Verification
                        </span>
                      )}

                      {!payment && (
                        <button
                          onClick={() => onPayDues(selectedMember.id, monthNum, currentYear)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          Pay ₹{settings?.monthlyAmount || 1000}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
