'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  IndianRupee, 
  Share2, 
  Printer, 
  Eye, 
  Filter,
  MessageCircle
} from 'lucide-react';
import { MemberMatrixRow, PaymentRecord, CommitteeSettings } from '@/types';

interface PaymentMatrixProps {
  matrix: MemberMatrixRow[];
  year: number;
  setYear: (year: number) => void;
  settings: CommitteeSettings | null;
  onSelectPaymentForReceipt: (payment: PaymentRecord) => void;
  onPayForMember: (memberId: string, month: number, year: number) => void;
  isAdminLoggedIn: boolean;
  onOpenAdminVerify: (paymentId: string) => void;
}

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const PaymentMatrix: React.FC<PaymentMatrixProps> = ({
  matrix,
  year,
  setYear,
  settings,
  onSelectPaymentForReceipt,
  onPayForMember,
  isAdminLoggedIn,
  onOpenAdminVerify
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');

  const currentMonth = new Date().getMonth() + 1; // 1-12
  const currentYear = new Date().getFullYear();

  // Filter members
  const filteredMatrix = matrix.filter(row => {
    const matchesSearch = row.member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          row.member.phone.includes(searchTerm);
    if (!matchesSearch) return false;

    if (filterType === 'PENDING') {
      // Members who have due or pending approval in the current month
      const currentMonthStatus = row.months[currentMonth]?.status;
      return currentMonthStatus === 'DUE' || currentMonthStatus === 'PENDING_APPROVAL';
    }
    if (filterType === 'PAID') {
      const currentMonthStatus = row.months[currentMonth]?.status;
      return currentMonthStatus === 'PAID';
    }
    return true;
  });

  // Calculate monthly column totals
  const monthlyTotals: Record<number, number> = {};
  for (let m = 1; m <= 12; m++) {
    monthlyTotals[m] = matrix.reduce((sum, row) => {
      if (row.months[m]?.status === 'PAID') {
        return sum + (row.months[m]?.amount || 0);
      }
      return sum;
    }, 0);
  }

  const grandTotalPaid = matrix.reduce((sum, row) => sum + row.totalPaid, 0);

  const handleWhatsAppReminder = (row: MemberMatrixRow, month: number) => {
    const memberName = row.member.name;
    const phone = row.member.phone.replace(/\D/g, '');
    const cleanPhone = phone.startsWith('91') ? phone : `91${phone}`;
    const monthName = MONTH_NAMES_SHORT[month - 1];
    const amount = settings?.monthlyAmount || 1000;
    const committeeName = settings?.committeeName || 'Committee';

    const text = encodeURIComponent(
      `नमस्ते ${memberName} जी,\n` +
      `${committeeName} का ${monthName} ${year} माह का ₹${amount} अंशदान अभी तक प्राप्त नहीं हुआ है।\n` +
      `कृपया समिति पोर्टल से UPI द्वारा भुगतान कर UTR नंबर सबमिट करें।\n` +
      `धन्यवाद! 🙏`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>📅 {year} Monthly Contribution Ledger</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {filteredMatrix.length} Members
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time status for every member. Tap any green cell to view digital receipt.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Year selector */}
          <div className="flex items-center rounded-lg border border-slate-200 p-1 bg-slate-50">
            {[2026, 2027].map(y => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                  year === y ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {y}
              </button>
            ))}
          </div>

          {/* Print / Export */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search member by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {(['ALL', 'PENDING', 'PAID'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                filterType === type
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {type === 'ALL' ? 'All Members' : type === 'PENDING' ? 'Due This Month' : 'Paid This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
        <span className="font-semibold text-slate-700">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          <span>Paid (₹1,000)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
          <span>Under Verification (UTR)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
          <span>Pending Due</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-300 inline-block" />
          <span>Not Joined Yet</span>
        </div>
      </div>

      {/* The Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 sticky left-0 z-20 bg-slate-50 min-w-[180px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                  Member Details
                </th>
                {MONTH_NAMES_SHORT.map((mName, idx) => {
                  const mNum = idx + 1;
                  const isCurrent = year === currentYear && mNum === currentMonth;
                  return (
                    <th 
                      key={mName} 
                      className={`py-3.5 px-2 text-center min-w-[72px] ${
                        isCurrent ? 'bg-emerald-50/80 text-emerald-900 border-x border-emerald-200/60 font-extrabold' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span>{mName}</span>
                        {isCurrent && (
                          <span className="text-[9px] uppercase font-extrabold text-emerald-700 tracking-tight">
                            Current
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
                <th className="py-3.5 px-4 text-right min-w-[100px] bg-slate-50">
                  Total Paid
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMatrix.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-400">
                    No members match the current filter or search criteria.
                  </td>
                </tr>
              ) : (
                filteredMatrix.map((row, rowIdx) => (
                  <tr key={row.member.id} className="hover:bg-slate-50/80 transition group">
                    {/* Member Column (Sticky) */}
                    <td className="py-3 px-4 sticky left-0 z-10 bg-white group-hover:bg-slate-50 transition shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {row.member.name.charAt(0)}
                        </div>
                        <div className="truncate max-w-[140px]">
                          <div className="font-bold text-slate-900 flex items-center gap-1 truncate">
                            {row.member.name}
                            {row.member.role === 'ADMIN' && (
                              <span className="text-[9px] px-1 py-0.2 rounded-sm bg-amber-100 text-amber-800 font-extrabold">
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {row.member.phone}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Months 1 to 12 */}
                    {MONTH_NAMES_SHORT.map((_, idx) => {
                      const mNum = idx + 1;
                      const monthData = row.months[mNum];
                      const status = monthData?.status;
                      const isCurrent = year === currentYear && mNum === currentMonth;

                      return (
                        <td 
                          key={mNum} 
                          className={`py-2 px-1 text-center align-middle ${
                            isCurrent ? 'bg-emerald-50/30 border-x border-emerald-100' : ''
                          }`}
                        >
                          {status === 'PAID' && (
                            <button
                              onClick={() => monthData.payment && onSelectPaymentForReceipt(monthData.payment)}
                              className="w-full py-1.5 px-1 rounded-md bg-emerald-100/80 hover:bg-emerald-200 text-emerald-800 font-bold text-[11px] flex flex-col items-center justify-center transition cursor-pointer group/btn"
                              title={`Verified Paid ₹${monthData.amount} on ${monthData.payment?.paidAt ? new Date(monthData.payment.paidAt).toLocaleDateString() : ''}. Click for receipt.`}
                            >
                              <div className="flex items-center gap-0.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>₹1k</span>
                              </div>
                            </button>
                          )}

                          {status === 'PENDING_APPROVAL' && (
                            <button
                              onClick={() => {
                                if (isAdminLoggedIn && monthData.payment) {
                                  onOpenAdminVerify(monthData.payment.id);
                                } else if (monthData.payment) {
                                  onSelectPaymentForReceipt(monthData.payment);
                                }
                              }}
                              className="w-full py-1.5 px-1 rounded-md bg-amber-100/90 hover:bg-amber-200 text-amber-900 font-bold text-[11px] flex flex-col items-center justify-center transition cursor-pointer"
                              title={`UTR: ${monthData.payment?.utrNumber || 'Submitted'}. Awaiting Admin Approval.`}
                            >
                              <div className="flex items-center gap-0.5">
                                <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                <span className="text-[10px]">Review</span>
                              </div>
                            </button>
                          )}

                          {status === 'DUE' && (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => onPayForMember(row.member.id, mNum, year)}
                                className="py-1 px-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[10px] border border-rose-200 transition cursor-pointer"
                                title="Click to pay or submit UTR"
                              >
                                Due
                              </button>
                              {isAdminLoggedIn && isCurrent && (
                                <button
                                  onClick={() => handleWhatsAppReminder(row, mNum)}
                                  className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer"
                                  title="Send WhatsApp Reminder"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}

                          {status === 'NOT_JOINED' && (
                            <span className="text-slate-300 font-bold text-center block" title="Member not joined yet">
                              -
                            </span>
                          )}
                        </td>
                      );
                    })}

                    {/* Total Paid Column */}
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                      <div className="flex items-center justify-end text-emerald-700">
                        <IndianRupee className="w-3 h-3 mr-0.5 stroke-[2.5]" />
                        {row.totalPaid.toLocaleString('en-IN')}
                      </div>
                      {row.totalDue > 0 && (
                        <div className="text-[10px] text-rose-600 font-semibold mt-0.5">
                          ₹{row.totalDue.toLocaleString('en-IN')} Due
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Monthly Column Sums Footer */}
            <tfoot>
              <tr className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-300">
                <td className="py-3.5 px-4 sticky left-0 z-10 bg-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                  Monthly Collections
                </td>
                {MONTH_NAMES_SHORT.map((_, idx) => {
                  const mNum = idx + 1;
                  const total = monthlyTotals[mNum] || 0;
                  return (
                    <td key={mNum} className="py-3.5 px-1 text-center">
                      <div className="text-[11px] font-extrabold text-emerald-700">
                        ₹{(total / 1000).toFixed(0)}k
                      </div>
                    </td>
                  );
                })}
                <td className="py-3.5 px-4 text-right font-black text-slate-950 text-sm">
                  ₹{grandTotalPaid.toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
