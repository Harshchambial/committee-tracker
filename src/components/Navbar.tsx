'use client';

import React from 'react';
import { 
  Building2, 
  IndianRupee, 
  LayoutDashboard, 
  Table2, 
  QrCode, 
  UserCheck, 
  ReceiptIndianRupee, 
  ShieldCheck, 
  Lock, 
  Unlock 
} from 'lucide-react';
import { CommitteeSettings, TreasurySummary } from '@/types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  summary: TreasurySummary | null;
  settings: CommitteeSettings | null;
  isAdminLoggedIn: boolean;
  onAdminClick: () => void;
  pendingApprovals: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  summary,
  settings,
  isAdminLoggedIn,
  onAdminClick,
  pendingApprovals
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'matrix', label: 'Payment Matrix', icon: Table2 },
    { id: 'pay', label: 'Pay Dues (UPI)', icon: QrCode, highlight: true },
    { id: 'my-ledger', label: 'My Ledger', icon: UserCheck },
    { id: 'expenses', label: 'Fund Utilization', icon: ReceiptIndianRupee },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand & Committee Info */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-none">
                  {settings?.committeeName || 'Committee Fund Tracker'}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ₹{settings?.monthlyAmount || 1000}/mo
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 truncate max-w-[200px] sm:max-w-md hidden sm:block">
                {settings?.tagline || 'Community Fund & Payment Transparency Portal'}
              </p>
            </div>
          </div>

          {/* Quick Stats & Admin Button */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Net Treasury Balance Pill */}
            <div className="flex items-center bg-slate-100 hover:bg-slate-200/80 transition px-3 py-1.5 rounded-lg border border-slate-200">
              <div className="flex flex-col text-right">
                <span className="text-[10px] uppercase font-semibold text-slate-500 leading-none">Treasury Balance</span>
                <span className="text-sm sm:text-base font-bold text-emerald-600 flex items-center justify-end leading-tight mt-0.5">
                  <IndianRupee className="w-3.5 h-3.5 inline mr-0.5 stroke-[2.5]" />
                  {(summary?.netBalance ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Admin Portal Button */}
            <button
              onClick={onAdminClick}
              className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition shadow-xs ${
                isAdminLoggedIn
                  ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-500/20'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {isAdminLoggedIn ? (
                <>
                  <Unlock className="w-4 h-4 text-amber-200" />
                  <span>Admin Panel</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Admin Login</span>
                </>
              )}
              {pendingApprovals > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {pendingApprovals}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-slate-100 py-1 sm:py-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : tab.highlight
                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.highlight ? 'text-emerald-700' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          {isAdminLoggedIn && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ml-auto ${
                activeTab === 'admin'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Management</span>
              {pendingApprovals > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-1">
                  {pendingApprovals}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
