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
  const desktopTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'matrix', label: 'Payment Matrix', icon: Table2 },
    { id: 'pay', label: 'Pay Dues (UPI)', icon: QrCode, highlight: true },
    { id: 'my-ledger', label: 'My Ledger', icon: UserCheck },
    { id: 'expenses', label: 'Fund Utilization', icon: ReceiptIndianRupee },
  ];

  const mobileTabs = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard },
    { id: 'matrix', label: 'Matrix', icon: Table2 },
    { id: 'pay', label: 'Pay ₹1k', icon: QrCode, isHero: true },
    { id: 'my-ledger', label: 'Ledger', icon: UserCheck },
    { id: 'expenses', label: 'Expenses', icon: ReceiptIndianRupee },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-20">
            {/* Brand & Committee Info */}
            <div 
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer min-w-0" 
              onClick={() => setActiveTab('overview')}
            >
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm sm:text-xl font-black text-slate-900 tracking-tight leading-none truncate max-w-[140px] sm:max-w-md">
                    {settings?.committeeName || 'Committee Fund'}
                  </h1>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-md text-[10px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    ₹{settings?.monthlyAmount || 1000}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate hidden sm:block">
                  {settings?.tagline || '100% Transparent Community Fund Portal'}
                </p>
              </div>
            </div>

            {/* Top Right: Balance & Admin */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Net Treasury Balance Pill */}
              <div className="flex items-center bg-slate-100/90 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl border border-slate-200">
                <div className="flex flex-col text-right">
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 leading-none">Balance</span>
                  <span className="text-xs sm:text-base font-black text-emerald-600 flex items-center justify-end leading-tight mt-0.5">
                    <IndianRupee className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline mr-0.5 stroke-[2.5]" />
                    {(summary?.netBalance ?? 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Admin Button */}
              <button
                onClick={onAdminClick}
                className={`relative inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  isAdminLoggedIn
                    ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-xs'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {isAdminLoggedIn ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-amber-200" />
                    <span className="hidden sm:inline">Admin</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hidden sm:inline">Admin Login</span>
                  </>
                )}
                {pendingApprovals > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-extrabold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {pendingApprovals}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Desktop Tab Navigation (Hidden on Mobile) */}
          <div className="hidden sm:flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-slate-100 py-2">
            {desktopTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : tab.highlight
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition cursor-pointer ml-auto ${
                  activeTab === 'admin'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Panel</span>
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

      {/* Mobile Bottom Navigation Bar (PhonePe / GPay Style) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 py-1 pb-safe">
        <div className="flex items-center justify-around">
          {mobileTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            if (tab.isHero) {
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex flex-col items-center justify-center -mt-5 cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 transform active:scale-90 transition border-2 border-white">
                    <Icon className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-black text-emerald-700 mt-0.5">
                    {tab.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition cursor-pointer ${
                  isActive ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600 stroke-[2.5]' : 'text-slate-400'}`} />
                <span className={`text-[10px] font-bold mt-0.5 ${isActive ? 'text-emerald-700 font-extrabold' : 'text-slate-500'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}

          {isAdminLoggedIn && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition cursor-pointer relative ${
                activeTab === 'admin' ? 'text-amber-700' : 'text-slate-500'
              }`}
            >
              <ShieldCheck className={`w-5 h-5 ${activeTab === 'admin' ? 'text-amber-600 stroke-[2.5]' : 'text-slate-400'}`} />
              <span className={`text-[10px] font-bold mt-0.5 ${activeTab === 'admin' ? 'text-amber-700' : 'text-slate-500'}`}>
                Admin
              </span>
              {pendingApprovals > 0 && (
                <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white animate-pulse" />
              )}
            </button>
          )}
        </div>
      </nav>
    </>
  );
};
