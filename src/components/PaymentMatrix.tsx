'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  IndianRupee, 
  Printer, 
  Filter,
  MessageCircle,
  LayoutGrid,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
  Receipt,
  QrCode
} from 'lucide-react';
import { MemberMatrixRow, PaymentRecord, CommitteeSettings } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

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
  const { t, isHindi, getMonthShort, getMonthName } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');
  // Default to Card view on mobile, Table on desktop
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');
  const [expandedMemberIds, setExpandedMemberIds] = useState<Record<string, boolean>>({});

  const currentMonth = new Date().getMonth() + 1; // 1-12
  const currentYear = new Date().getFullYear();

  const toggleExpand = (id: string) => {
    setExpandedMemberIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredMatrix = matrix.filter(row => {
    const matchesSearch = row.member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          row.member.phone.includes(searchTerm);
    if (!matchesSearch) return false;

    if (filterType === 'PENDING') {
      return row.months[currentMonth]?.status !== 'PAID';
    }
    if (filterType === 'PAID') {
      return row.months[currentMonth]?.status === 'PAID';
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
    const monthName = getMonthName(month);
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

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>📅 {year} Payment Ledger</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {filteredMatrix.length} Members
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Tap any green card/badge to view digital receipt.
            </p>
          </div>

          {/* View Mode Toggle for Mobile */}
          <div className="flex sm:hidden items-center bg-slate-100 rounded-lg p-1 border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode('CARDS')}
              className={`p-1.5 rounded-md transition ${viewMode === 'CARDS' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'}`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded-md transition ${viewMode === 'TABLE' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'}`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
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

          {/* Desktop View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button
              onClick={() => setViewMode('CARDS')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                viewMode === 'CARDS' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Cards
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                viewMode === 'TABLE' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              Table
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search member or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {(['ALL', 'PENDING', 'PAID'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
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

      {/* MOBILE-OPTIMIZED MEMBER CARDS VIEW */}
      {viewMode === 'CARDS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredMatrix.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
              No members found matching your filter.
            </div>
          ) : (
            filteredMatrix.map(row => {
              const isExpanded = Boolean(expandedMemberIds[row.member.id]);
              const currentMonthData = row.months[currentMonth];
              const isCurrentPaid = currentMonthData?.status === 'PAID';
              const isCurrentPending = currentMonthData?.status === 'PENDING_APPROVAL';

              return (
                <div 
                  key={row.member.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden hover:border-emerald-300 transition"
                >
                  {/* Card Top: Member info & Current Month Status */}
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black flex items-center justify-center text-sm shrink-0 shadow-xs">
                          {row.member.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-slate-900 text-sm truncate flex items-center gap-1">
                            {row.member.name}
                            {row.member.role === 'ADMIN' && (
                              <span className="text-[9px] px-1 py-0.2 rounded-sm bg-amber-100 text-amber-800 font-extrabold shrink-0">
                                Admin
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-slate-500 font-mono truncate">{row.member.phone}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Paid</span>
                        <span className="text-xs font-black text-emerald-700 flex items-center justify-end">
                          <IndianRupee className="w-3 h-3 stroke-[2.5]" />
                          {row.totalPaid.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Current Month Highlight Bar */}
                    <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <span>{getMonthShort(currentMonth)} {year}:</span>
                        {isCurrentPaid && (
                          <div className="inline-flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md font-extrabold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {isHindi ? 'जमा ₹1,000' : 'Paid ₹1,000'}
                            </span>
                            {currentMonthData.payment?.paidAt && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
                                📅 {new Date(currentMonthData.payment.paidAt).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </span>
                            )}
                          </div>
                        )}
                        {isCurrentPending && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md font-bold">
                            <Clock className="w-3 h-3 text-amber-600" />
                            {isHindi ? 'जांच में' : 'Review'}
                          </span>
                        )}
                        {!isCurrentPaid && !isCurrentPending && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md font-bold">
                            <AlertCircle className="w-3 h-3" />
                            {isHindi ? 'बाकी ₹1,000' : 'Due ₹1,000'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isCurrentPaid && currentMonthData.payment && (
                          <button
                            onClick={() => onSelectPaymentForReceipt(currentMonthData.payment!)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 transition cursor-pointer"
                          >
                            <Receipt className="w-3 h-3 text-emerald-600" />
                            {isHindi ? 'रसीद' : 'Receipt'}
                          </button>
                        )}
                        {!isCurrentPaid && !isCurrentPending && (
                          <button
                            onClick={() => onPayForMember(row.member.id, currentMonth, year)}
                            className="inline-flex items-center gap-1 text-[11px] font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 rounded-lg shadow-xs transition cursor-pointer"
                          >
                            <QrCode className="w-3 h-3" />
                            {isHindi ? 'दें' : 'Pay'}
                          </button>
                        )}
                        {isAdminLoggedIn && !isCurrentPaid && !isCurrentPending && (
                          <button
                            onClick={() => handleWhatsAppReminder(row, currentMonth)}
                            className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                            title="Send WhatsApp Reminder"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expand / Collapse 12 Months Mini-Grid */}
                  <div className="border-t border-slate-100">
                    <button
                      onClick={() => toggleExpand(row.member.id)}
                      className="w-full py-2 px-4 bg-slate-50/70 hover:bg-slate-100 text-[11px] font-bold text-slate-600 flex items-center justify-between transition cursor-pointer"
                    >
                      <span>{isHindi ? `सभी 12 माह स्थिति (${year})` : `All 12 Months Status (${year})`}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="p-3 bg-white grid grid-cols-4 sm:grid-cols-6 gap-1.5 border-t border-slate-100">
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(mNum => {
                          const mData = row.months[mNum];
                          const status = mData?.status;
                          const isCurrent = year === currentYear && mNum === currentMonth;

                          return (
                            <div
                              key={mNum}
                              className={`p-1.5 rounded-lg text-center border transition ${
                                status === 'PAID'
                                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                                  : status === 'PENDING_APPROVAL'
                                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                                  : status === 'DUE'
                                  ? 'bg-rose-50/60 border-rose-200 text-rose-700'
                                  : 'bg-slate-50 border-slate-100 text-slate-400'
                              } ${isCurrent ? 'ring-2 ring-emerald-500/50' : ''}`}
                            >
                              <div className="text-[10px] font-bold uppercase">{getMonthShort(mNum)}</div>
                              <div className="text-[10px] font-extrabold mt-0.5">
                                {status === 'PAID' ? (
                                  <button
                                    onClick={() => mData.payment && onSelectPaymentForReceipt(mData.payment)}
                                    className="hover:underline flex flex-col items-center justify-center gap-0.5 w-full py-0.5"
                                  >
                                    <div className="flex items-center justify-center gap-0.5 w-full">
                                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                      <span>₹1k</span>
                                    </div>
                                    {mData.payment?.paidAt && (
                                      <span className="text-[8px] font-mono text-emerald-700/90 font-bold leading-none">
                                        {new Date(mData.payment.paidAt).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
                                          day: 'numeric',
                                          month: 'short'
                                        })}
                                      </span>
                                    )}
                                  </button>
                                ) : status === 'PENDING_APPROVAL' ? (
                                  <span>{isHindi ? 'जांच' : 'Rev'}</span>
                                ) : status === 'DUE' ? (
                                  <button 
                                    onClick={() => onPayForMember(row.member.id, mNum, year)}
                                    className="text-rose-700 hover:underline"
                                  >
                                    {isHindi ? 'बाकी' : 'Due'}
                                  </button>
                                ) : (
                                  '-'
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* SPREADSHEET TABLE VIEW */}
      {viewMode === 'TABLE' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3.5 sticky left-0 z-20 bg-slate-50 min-w-[160px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    {isHindi ? 'कोर सदस्य विवरण' : 'Member Details'}
                  </th>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(mNum => {
                    const mName = getMonthShort(mNum);
                    const isCurrent = year === currentYear && mNum === currentMonth;
                    return (
                      <th 
                        key={mNum} 
                        className={`py-3 px-2 text-center min-w-[65px] ${
                          isCurrent ? 'bg-emerald-50 text-emerald-900 border-x border-emerald-200 font-extrabold' : ''
                        }`}
                      >
                        {mName}
                      </th>
                    );
                  })}
                  <th className="py-3 px-3 text-right min-w-[90px] bg-slate-50">
                    {isHindi ? 'कुल जमा' : 'Total'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMatrix.map(row => (
                  <tr key={row.member.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3.5 sticky left-0 z-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                          {row.member.name.charAt(0)}
                        </div>
                        <div className="truncate max-w-[130px]">
                          <div className="font-bold text-slate-900 truncate text-xs">{row.member.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{row.member.phone}</div>
                        </div>
                      </div>
                    </td>

                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(mNum => {
                      const monthData = row.months[mNum];
                      const status = monthData?.status;
                      return (
                        <td key={mNum} className="py-2 px-1 text-center align-middle">
                          {status === 'PAID' && (
                            <button
                              onClick={() => monthData.payment && onSelectPaymentForReceipt(monthData.payment)}
                              className="w-full py-1 px-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[10px] transition cursor-pointer flex flex-col items-center justify-center leading-tight"
                            >
                              <span className="flex items-center justify-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700" />
                                <span>₹1k</span>
                              </span>
                              {monthData.payment?.paidAt && (
                                <span className="text-[8px] font-mono text-emerald-800 font-semibold">
                                  {new Date(monthData.payment.paidAt).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
                                    day: 'numeric',
                                    month: 'short'
                                  })}
                                </span>
                              )}
                            </button>
                          )}
                          {status === 'PENDING_APPROVAL' && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1 py-0.5 rounded-md block">
                              Rev
                            </span>
                          )}
                          {status === 'DUE' && (
                            <button
                              onClick={() => onPayForMember(row.member.id, mNum, year)}
                              className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1 py-0.5 rounded-md hover:bg-rose-100 transition cursor-pointer"
                            >
                              Due
                            </button>
                          )}
                          {status === 'NOT_JOINED' && <span className="text-slate-300">-</span>}
                        </td>
                      );
                    })}

                    <td className="py-2 px-3 text-right font-extrabold text-emerald-700">
                      ₹{(row.totalPaid / 1000).toFixed(0)}k
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
