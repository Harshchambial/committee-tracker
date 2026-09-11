'use client';

import React from 'react';
import { 
  IndianRupee, 
  TrendingUp, 
  Users, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  Shield, 
  FileSpreadsheet,
  HeartHandshake,
  Building2,
  Sparkles
} from 'lucide-react';
import { TreasurySummary, CommitteeSettings } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface TreasuryOverviewProps {
  summary: TreasurySummary | null;
  settings: CommitteeSettings | null;
  onPayClick: () => void;
  onMatrixClick: () => void;
  onExpensesClick: () => void;
  onJanSahayogClick?: () => void;
  isAdminLoggedIn?: boolean;
  onOpenAddPaidMember?: () => void;
}

export const TreasuryOverview: React.FC<TreasuryOverviewProps> = ({
  summary,
  settings,
  onPayClick,
  onMatrixClick,
  onExpensesClick,
  onJanSahayogClick,
  isAdminLoggedIn,
  onOpenAddPaidMember
}) => {
  const { t, isHindi } = useLanguage();

  const coreCollected = summary?.coreCollected ?? 0;
  const publicCollected = summary?.publicCollected ?? 0;
  const totalCollected = summary?.totalCollected ?? (coreCollected + publicCollected);

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 sm:pb-0">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('transparencyBadge')}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight">
              {settings?.committeeName || (isHindi ? 'विकास सहयोग समिति' : 'Vikas Sahayog Samiti')}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {isHindi ? (
                <>
                  <strong className="text-white">सार्वजनिक कार्य हेतु जन सहयोग।</strong> कोर सदस्य नियमित <strong className="text-emerald-300">₹{settings?.monthlyAmount || 1000}/माह</strong> देते हैं, तथा कोई भी नागरिक अपनी इच्छानुसार जन कल्याण हेतु सहयोग कर सकता है। पाई-पाई का हिसाब सार्वजनिक है।
                </>
              ) : (
                <>
                  <strong className="text-white">Public Money for Public Work.</strong> Core members contribute <strong className="text-emerald-300">₹{settings?.monthlyAmount || 1000}/month</strong>, and voluntary contributions are open to everyone for community welfare.
                </>
              )}
            </p>
          </div>

          {/* Quick Pay CTA buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
            <button
              onClick={onPayClick}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition cursor-pointer active:scale-95 text-center"
            >
              <QrCode className="w-4 h-4" />
              <span>{isHindi ? 'सहयोग राशि दें (UPI)' : 'Contribute / Pay (UPI)'}</span>
            </button>

            <button
              onClick={onMatrixClick}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-3 sm:px-4 sm:py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition cursor-pointer border border-white/15 text-center"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>{isHindi ? '12-मासिक सूची' : '12-Mo Matrix'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Fast-Action Banner: Quick Entry for Received Payments */}
      {isAdminLoggedIn && onOpenAddPaidMember && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/70 border border-emerald-300/80 rounded-2xl p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-emerald-950 flex items-center gap-1.5">
                <span>{isHindi ? 'पैसे मिल चुके हैं? तुरंत यहाँ दर्ज करें:' : 'Already received payments in cash/UPI?'}</span>
              </h4>
              <p className="text-xs text-emerald-800 font-medium mt-0.5">
                {isHindi 
                  ? 'नाम, 10 अंकों का फोन नंबर व राशि भरकर एक क्लिक में रसीद बनाएं।' 
                  : 'Mandatory name, 10-digit phone & amount. Instantly logs verified payment and generates receipt.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenAddPaidMember}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-black shadow-md transition cursor-pointer shrink-0 active:scale-95"
          >
            <span>➕ {isHindi ? 'प्राप्त भुगतान जोड़ें (Quick Add)' : 'Add Paid Member (+ Receipt)'}</span>
          </button>
        </div>
      )}

      {/* 4-Stat High-Trust Financial Breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* 1. Net Available Balance In Hand */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('availableBalance')}
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <IndianRupee className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <div className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center">
              <span className="text-base sm:text-2xl text-emerald-600 mr-0.5">₹</span>
              {(summary?.netBalance ?? 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 truncate">
              {t('bankCashBalance')}
            </p>
          </div>
        </div>

        {/* 2. Core Member Monthly Funds */}
        <div 
          onClick={onMatrixClick}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('coreCollections')}
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <div className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center">
              <span className="text-base sm:text-2xl text-blue-600 mr-0.5">₹</span>
              {coreCollected.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] sm:text-xs text-blue-700 font-bold mt-0.5 truncate">
              {summary?.coreMembersCount ?? 1} {isHindi ? 'कोर सदस्य (₹1k/माह)' : 'Core Members'} →
            </p>
          </div>
        </div>

        {/* 3. Jan Sahayog (Voluntary Public Contributions) */}
        <div 
          onClick={onJanSahayogClick}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-orange-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('publicDonations')}
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <div className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center">
              <span className="text-base sm:text-2xl text-orange-600 mr-0.5">₹</span>
              {publicCollected.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] sm:text-xs text-orange-700 font-bold mt-0.5 truncate">
              {isHindi ? 'स्वैच्छिक जन सहयोग देखें →' : 'View public donations →'}
            </p>
          </div>
        </div>

        {/* 4. Total Public Works Spent */}
        <div 
          onClick={onExpensesClick}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-amber-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('totalSpent')}
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <div className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center">
              <span className="text-base sm:text-2xl text-amber-600 mr-0.5">₹</span>
              {(summary?.totalExpenses ?? 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] sm:text-xs text-amber-700 font-bold mt-0.5 truncate">
              {t('viewExpenses')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
