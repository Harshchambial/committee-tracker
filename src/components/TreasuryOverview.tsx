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
  FileSpreadsheet 
} from 'lucide-react';
import { TreasurySummary, CommitteeSettings } from '@/types';

interface TreasuryOverviewProps {
  summary: TreasurySummary | null;
  settings: CommitteeSettings | null;
  onPayClick: () => void;
  onMatrixClick: () => void;
  onExpensesClick: () => void;
}

export const TreasuryOverview: React.FC<TreasuryOverviewProps> = ({
  summary,
  settings,
  onPayClick,
  onMatrixClick,
  onExpensesClick
}) => {
  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

  const collectionPercent = summary && summary.currentMonthTarget > 0
    ? Math.round((summary.currentMonthCollections / summary.currentMonthTarget) * 100)
    : 0;

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 sm:pb-0">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="max-w-xl space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
              <Shield className="w-3 h-3" />
              100% Transparent Community Ledger
            </div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight">
              {settings?.committeeName || 'Committee Fund'}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Every member contributes <strong className="text-white font-bold">₹{settings?.monthlyAmount || 1000}/month</strong>. 
              All bank receipts and expenses are publicly tracked here for complete honesty.
            </p>
          </div>

          {/* Quick Pay CTA buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onPayClick}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-base shadow-md shadow-emerald-500/20 transition cursor-pointer active:scale-95 text-center"
            >
              <QrCode className="w-4 h-4" />
              Pay ₹{settings?.monthlyAmount || 1000} (UPI)
            </button>
            <button
              onClick={onMatrixClick}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-base transition cursor-pointer border border-white/15 text-center"
            >
              <FileSpreadsheet className="w-4 h-4" />
              12-Mo Matrix
            </button>
          </div>
        </div>
      </div>

      {/* 2x2 Mobile Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Net Treasury Balance */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">In Hand</span>
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
              Bank / Cash balance
            </p>
          </div>
        </div>

        {/* Total Funds Collected */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">Total Collected</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <div className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center">
              <span className="text-base sm:text-2xl text-blue-600 mr-0.5">₹</span>
              {(summary?.totalCollected ?? 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 truncate">
              Lifetime contributions
            </p>
          </div>
        </div>

        {/* Total Expenses / Fund Used */}
        <div 
          onClick={onExpensesClick}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-amber-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">Total Spent</span>
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
              View expenses →
            </p>
          </div>
        </div>

        {/* Total Committee Members */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-purple-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">Members</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Users className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <div className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {summary?.activeMembers ?? 0}
              <span className="text-xs font-normal text-slate-500 ml-1">Active</span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 truncate">
              ₹{settings?.monthlyAmount || 1000}/mo each
            </p>
          </div>
        </div>
      </div>

      {/* Current Month Progress */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              {currentMonthName} {currentYear} Progress
            </h3>
            <p className="text-[11px] text-slate-500">
              Target: ₹{(summary?.currentMonthTarget ?? 0).toLocaleString('en-IN')} ({summary?.activeMembers} × ₹{settings?.monthlyAmount || 1000})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              ₹{(summary?.currentMonthCollections ?? 0).toLocaleString('en-IN')} Received
            </span>
            {summary && summary.currentMonthPendingCount > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {summary.currentMonthPendingCount} Due
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(collectionPercent, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5 font-bold">
          <span>{collectionPercent}% Collected</span>
          <span>Pending: ₹{((summary?.currentMonthTarget ?? 0) - (summary?.currentMonthCollections ?? 0)).toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
};
