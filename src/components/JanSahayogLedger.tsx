'use client';

import React, { useState } from 'react';
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
  Users
} from 'lucide-react';
import { PaymentRecord, TreasurySummary, CommitteeSettings } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface JanSahayogLedgerProps {
  payments: PaymentRecord[];
  members?: import('@/types').Member[];
  summary: TreasurySummary | null;
  settings: CommitteeSettings | null;
  onContributeClick: () => void;
  onViewReceipt: (payment: PaymentRecord) => void;
}

export const JanSahayogLedger: React.FC<JanSahayogLedgerProps> = ({
  payments,
  summary,
  settings,
  onContributeClick,
  onViewReceipt
}) => {
  const { t, isHindi } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

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

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 font-mono truncate">
                  Ref: {item.utrNumber ? item.utrNumber.slice(-8) : item.method}
                </span>

                <button
                  onClick={() => onViewReceipt(item)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>{t('viewReceipt')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
