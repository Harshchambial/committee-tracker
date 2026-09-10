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
  AlertCircle,
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
    <div className="space-y-6">
      {/* Top Banner / Welcome Notice */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Shield className="w-3.5 h-3.5" />
              100% Transparent Community Ledger
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {settings?.committeeName || 'Committee Fund Portal'}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Every member contributes <strong className="text-white font-bold">₹{settings?.monthlyAmount || 1000}/month</strong>. 
              All payments, bank receipts, and fund expenses are publicly tracked here for complete honesty and brotherhood.
            </p>
          </div>

          {/* Quick Pay CTA button */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onPayClick}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/25 transition cursor-pointer active:scale-95"
            >
              <QrCode className="w-5 h-5" />
              Pay ₹{settings?.monthlyAmount || 1000} (UPI QR)
            </button>
            <button
              onClick={onMatrixClick}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm sm:text-base transition cursor-pointer border border-white/15"
            >
              <FileSpreadsheet className="w-4 h-4" />
              View 12-Month Matrix
            </button>
          </div>
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Net Treasury Balance */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Net Treasury In Hand</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
              <span className="text-2xl text-emerald-600 mr-1">₹</span>
              {(summary?.netBalance ?? 0).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Total in Bank / Cash balance
            </p>
          </div>
        </div>

        {/* Total Funds Collected */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Funds Collected</span>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
              <span className="text-2xl text-blue-600 mr-1">₹</span>
              {(summary?.totalCollected ?? 0).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Lifetime contributions across all months
            </p>
          </div>
        </div>

        {/* Total Expenses / Fund Used */}
        <div 
          onClick={onExpensesClick}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-amber-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Funds Utilized / Spent</span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition">
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
              <span className="text-2xl text-amber-600 mr-1">₹</span>
              {(summary?.totalExpenses ?? 0).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-amber-700 font-medium mt-1 flex items-center gap-1">
              Click to view all itemized expenses →
            </p>
          </div>
        </div>

        {/* Total Committee Members */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-purple-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Committee Members</span>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Users className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {summary?.activeMembers ?? 0}
              <span className="text-sm font-normal text-slate-500 ml-1.5">Members</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Scalable to 100+ members seamlessly
            </p>
          </div>
        </div>
      </div>

      {/* Current Month Progress Bar & Status */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              {currentMonthName} {currentYear} Collection Progress
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Target collection: ₹{(summary?.currentMonthTarget ?? 0).toLocaleString('en-IN')} ({summary?.activeMembers} members × ₹{settings?.monthlyAmount || 1000})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              ₹{(summary?.currentMonthCollections ?? 0).toLocaleString('en-IN')} Received
            </span>
            {summary && summary.currentMonthPendingCount > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {summary.currentMonthPendingCount} Due
              </span>
            )}
            {summary && summary.pendingApprovalsCount > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                {summary.pendingApprovalsCount} Awaiting Admin Approval
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(collectionPercent, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs text-slate-500 mt-2 font-medium">
          <span>{collectionPercent}% Collected for {currentMonthName}</span>
          <span>Pending: ₹{((summary?.currentMonthTarget ?? 0) - (summary?.currentMonthCollections ?? 0)).toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* How it Works / Transparency Promise Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm mb-3">
            1
          </div>
          <h4 className="text-sm font-bold text-slate-900">Scan & Pay ₹1,000 Direct</h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Click &quot;Pay Dues&quot; to view the pre-filled UPI QR code. Pay directly from GPay, PhonePe, or Paytm with ₹0 transaction fee.
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80">
          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm mb-3">
            2
          </div>
          <h4 className="text-sm font-bold text-slate-900">Enter 12-Digit UTR</h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Submit your 12-digit UPI reference number. Our system prevents duplicates and sends it straight to the Admin for 1-tap verification.
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80">
          <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm mb-3">
            3
          </div>
          <h4 className="text-sm font-bold text-slate-900">100% Real-Time Transparency</h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Check your payment status anytime on the 12-Month Matrix, download digital receipts, and see exactly where community funds are spent.
          </p>
        </div>
      </div>
    </div>
  );
};
