'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  HeartHandshake, 
  IndianRupee, 
  Search, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  QrCode, 
  Receipt, 
  ShieldCheck, 
  Sparkles,
  Users,
  Trash2,
  ArrowRightLeft,
  X,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { PaymentRecord, TreasurySummary, CommitteeSettings, AuthUser, Member } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface JanSahayogLedgerProps {
  payments: PaymentRecord[];
  members?: Member[];
  summary: TreasurySummary | null;
  settings: CommitteeSettings | null;
  currentUser?: AuthUser | null;
  adminPin?: string;
  onRefresh?: () => void;
  onContributeClick: () => void;
  onViewReceipt: (payment: PaymentRecord) => void;
}

export const JanSahayogLedger: React.FC<JanSahayogLedgerProps> = ({
  payments,
  members = [],
  summary,
  settings,
  currentUser,
  adminPin = '',
  onRefresh,
  onContributeClick,
  onViewReceipt
}) => {
  const { t, isHindi, getMonthName } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  // Conversion Modal State
  const [convertingPayment, setConvertingPayment] = useState<PaymentRecord | null>(null);
  const [targetMemberId, setTargetMemberId] = useState<string>('');
  const [targetMonth, setTargetMonth] = useState<number>(new Date().getMonth() + 1);
  const [targetYear, setTargetYear] = useState<number>(new Date().getFullYear());
  const [isSubmittingConvert, setIsSubmittingConvert] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'CO_ADMIN';
  const coreMembers = members.filter(m => m.status === 'ACTIVE' && m.memberType !== 'VOLUNTARY');

  // Filter only verified public voluntary contributions
  const publicPayments = payments.filter(p => 
    p.status === 'VERIFIED' && 
    (p.contributionType === 'PUBLIC_SEVA' || (p.amount !== (settings?.monthlyAmount || 1000) && p.contributionType !== 'CORE_MONTHLY'))
  );

  const filtered = publicPayments.filter(p => 
    p.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.purpose && p.purpose.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.utrNumber && p.utrNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalRaised = publicPayments.reduce((sum, p) => sum + p.amount, 0);

  // Handle Delete Contribution
  const handleDeleteContribution = async (item: PaymentRecord) => {
    const confirmMsg = isHindi
      ? `क्या आप वाकई "${item.memberName}" का ₹${item.amount.toLocaleString('en-IN')} का यह सहयोग हटाना चाहते हैं?`
      : `Are you sure you want to delete this contribution of ₹${item.amount.toLocaleString('en-IN')} from "${item.memberName}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/payments?id=${item.id}&adminPin=${adminPin}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete payment');
      onRefresh?.();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Open Convert Modal
  const handleOpenConvertModal = (item: PaymentRecord) => {
    setConvertingPayment(item);
    setConvertError(null);
    setTargetMonth(item.month || new Date().getMonth() + 1);
    setTargetYear(item.year || new Date().getFullYear());

    // Auto-match member if name exists in core members
    const matched = coreMembers.find(m => 
      m.name.toLowerCase().trim() === item.memberName.toLowerCase().trim()
    );
    setTargetMemberId(matched ? matched.id : (coreMembers[0]?.id || ''));
  };

  // Submit Conversion
  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingPayment || !targetMemberId) return;

    setIsSubmittingConvert(true);
    setConvertError(null);

    try {
      const res = await fetch('/api/payments/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: convertingPayment.id,
          memberId: targetMemberId,
          month: Number(targetMonth),
          year: Number(targetYear),
          adminPin
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Conversion failed');
      }

      confetti({ particleCount: 40, spread: 50 });
      setConvertingPayment(null);
      onRefresh?.();
    } catch (err: any) {
      setConvertError(err.message);
    } finally {
      setIsSubmittingConvert(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero Banner for Public Seva */}
      <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-xl space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold border border-white/30 backdrop-blur-xs">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>{isHindi ? 'सार्वजनिक कार्य हेतु खुला जन सहयोग' : 'Public Money for Public Work'}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight">
              {t('janSahayogTitle')}
            </h2>
            <p className="text-amber-100 text-xs sm:text-sm leading-relaxed">
              {t('janSahayogSubtitle')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/20 text-center sm:text-right">
              <span className="text-[10px] uppercase font-bold text-amber-200 block">
                {isHindi ? 'कुल जन सहयोग राशि' : 'Total Raised in Sahayog'}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center sm:justify-end mt-0.5">
                <span className="text-lg sm:text-xl font-bold mr-0.5">₹</span>
                {totalRaised.toLocaleString('en-IN')}
              </div>
            </div>

            <button
              onClick={onContributeClick}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white text-orange-700 hover:bg-orange-50 font-black text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-95 text-center"
            >
              <QrCode className="w-4 h-4" />
              <span>{isHindi ? 'सहयोग राशि दें (UPI)' : 'Contribute Online'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notice Card */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 text-xs text-amber-900">
        <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
        <p className="font-medium">
          {t('contributeAnyAmountNotice')}
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isHindi ? 'सहयोगी का नाम या कार्य खोजें...' : 'Search contributor name or cause...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
        <div className="text-xs font-bold text-slate-500 whitespace-nowrap hidden sm:block">
          {filtered.length} {isHindi ? 'सहयोग दर्ज' : 'contributions'}
        </div>
      </div>

      {/* Contribution Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
          <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">
            {t('noPublicContributionsYet')}
          </h4>
          <button
            onClick={onContributeClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{isHindi ? 'पहला सहयोग दें' : 'Make First Contribution'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-amber-300 transition flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">
                      {item.memberName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.paidAt).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base sm:text-lg font-black text-amber-600 flex items-center justify-end">
                      <span className="text-xs sm:text-sm mr-0.5">₹</span>
                      {item.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md border border-emerald-200 mt-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      {isHindi ? 'सत्यापित' : 'Verified'}
                    </span>
                  </div>
                </div>

                {item.purpose && (
                  <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-900 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/60 max-w-full truncate">
                    <Tag className="w-3 h-3 text-amber-600 shrink-0" />
                    <span className="truncate">{item.purpose}</span>
                  </div>
                )}

                {item.notes && (
                  <p className="text-[11px] text-slate-600 italic mt-2 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    &quot;{item.notes}&quot;
                  </p>
                )}
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onViewReceipt(item)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer shrink-0"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>{t('viewReceipt')}</span>
                </button>

                {/* Admin Management Controls: Convert & Delete */}
                {isAdmin && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenConvertModal(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition cursor-pointer border border-indigo-200"
                      title={isHindi ? 'कोर सदस्य में बदलें' : 'Convert to Core Member'}
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      <span>{isHindi ? 'सदस्य में बदलें' : 'Convert'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteContribution(item)}
                      className="inline-flex items-center gap-1 p-1 sm:px-2 sm:py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition cursor-pointer border border-rose-200"
                      title={isHindi ? 'सहयोग प्रविष्टि हटाएं' : 'Delete contribution'}
                    >
                      <Trash2 className="w-3 h-3" />
                      <span className="hidden sm:inline">{isHindi ? 'हटाएं' : 'Delete'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Convert to Core Member Modal */}
      {convertingPayment && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConvertingPayment(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 my-auto">
            <button
              type="button"
              onClick={() => setConvertingPayment(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 flex items-center justify-center transition cursor-pointer border border-slate-200"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            <div className="text-center pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center mx-auto mb-2.5 shadow-xs">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {isHindi ? 'कोर सदस्य में बदलें' : 'Convert to Core Member'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {convertingPayment.memberName} (₹{convertingPayment.amount.toLocaleString('en-IN')})
              </p>
            </div>

            {convertError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{convertError}</span>
              </div>
            )}

            <form onSubmit={handleConvertSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  {isHindi ? 'कोर सदस्य चुनें *' : 'Assign to Core Member *'}
                </label>
                <select
                  value={targetMemberId}
                  onChange={(e) => setTargetMemberId(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold bg-white text-slate-900"
                >
                  {coreMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.phone})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  {isHindi 
                    ? 'यह भुगतान चुने गए सदस्य के 12-माह मैट्रिक्स में दर्ज होगा' 
                    : 'This payment will be linked to the chosen member in the monthly matrix.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    {isHindi ? 'माह *' : 'Month *'}
                  </label>
                  <select
                    value={targetMonth}
                    onChange={(e) => setTargetMonth(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{getMonthName(m)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    {isHindi ? 'वर्ष *' : 'Year *'}
                  </label>
                  <select
                    value={targetYear}
                    onChange={(e) => setTargetYear(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white"
                  >
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isHindi ? 'मैट्रिक्स अपडेट' : 'Matrix Update'}</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {isHindi 
                    ? `बदलाव के बाद ${getMonthName(targetMonth)} ${targetYear} का बॉक्स सदस्य के नाम के आगे हरा (सत्यापित) हो जाएगा।` 
                    : `After conversion, ${getMonthName(targetMonth)} ${targetYear} will turn green (verified) in the matrix.`}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConvertingPayment(null)}
                  className="w-1/3 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingConvert || !targetMemberId}
                  className="w-2/3 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs tracking-wide shadow-md transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSubmittingConvert 
                    ? (isHindi ? 'बदल रहे हैं...' : 'Converting...') 
                    : (isHindi ? 'बदलाव की पुष्टि करें' : 'Confirm Conversion')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
