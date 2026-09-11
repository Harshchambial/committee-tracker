'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  IndianRupee, 
  LayoutDashboard, 
  Table2, 
  QrCode, 
  UserCheck, 
  ReceiptIndianRupee, 
  ShieldCheck, 
  LogOut,
  User as UserIcon,
  HeartHandshake,
  Languages,
  ChevronDown,
  Settings as SettingsIcon,
  Sparkles
} from 'lucide-react';
import { CommitteeSettings, TreasurySummary, AuthUser } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  summary: TreasurySummary | null;
  settings: CommitteeSettings | null;
  currentUser: AuthUser | null;
  onLogout: () => void;
  onOpenChangePassword?: () => void;
  onOpenAdminProfile?: () => void;
  pendingApprovals: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  summary,
  settings,
  currentUser,
  onLogout,
  onOpenAdminProfile,
  pendingApprovals
}) => {
  const { t, language, toggleLanguage, isHindi } = useLanguage();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsUserMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Decluttered Desktop Navigation Tabs (Receipts relocated to User Profile & Settings)
  const desktopTabs = [
    { id: 'overview', label: t('tabOverview'), icon: LayoutDashboard },
    { id: 'jan-sahayog', label: t('tabJanSahayog'), icon: HeartHandshake },
    { id: 'matrix', label: t('tabMatrix'), icon: Table2 },
    { id: 'pay', label: t('tabPay'), icon: QrCode, highlight: true },
    { id: 'expenses', label: t('tabExpenses'), icon: ReceiptIndianRupee },
  ];

  // Decluttered 5-Button Mobile Navigation (Thumb-friendly, no crowding)
  const mobileTabs = [
    { id: 'overview', label: isHindi ? 'कोष' : 'Home', icon: LayoutDashboard },
    { id: 'jan-sahayog', label: isHindi ? 'सहयोग' : 'Sahayog', icon: HeartHandshake },
    { id: 'pay', label: isHindi ? 'सहयोग दें' : 'Donate', icon: QrCode, isHero: true },
    { id: 'matrix', label: isHindi ? 'मासिक' : 'Matrix', icon: Table2 },
    { id: 'expenses', label: isHindi ? 'कार्य' : 'Works', icon: ReceiptIndianRupee },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-20">
            {/* Brand & Committee Info */}
            <div 
              className="flex items-center gap-2 sm:gap-3 cursor-pointer min-w-0" 
              onClick={() => setActiveTab('overview')}
            >
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                <Building2 className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xs sm:text-xl font-black text-slate-900 tracking-tight leading-none truncate max-w-[125px] xs:max-w-[160px] sm:max-w-xs">
                    {settings?.committeeName || (isHindi ? 'विकास सहयोग समिति' : 'Vikas Samiti')}
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                    ₹{settings?.monthlyAmount || 1000}/mo
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate hidden sm:block">
                  {settings?.tagline || t('committeeTagline')}
                </p>
              </div>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
              {/* Language Switcher Toggle */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-900 text-[11px] sm:text-xs font-black transition cursor-pointer active:scale-95 shadow-2xs"
                title={isHindi ? 'Switch to English' : 'हिन्दी में बदलें'}
              >
                <Languages className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span className="font-bold">{language === 'hi' ? 'EN' : 'हिन्दी'}</span>
              </button>

              {/* Net Treasury Balance - Desktop Only */}
              <div className="hidden md:flex items-center bg-slate-100/90 px-3 py-1.5 rounded-xl border border-slate-200">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 leading-none">
                    {isHindi ? 'कोष' : 'Balance'}
                  </span>
                  <span className="text-base font-black text-emerald-600 flex items-center justify-end leading-tight mt-0.5">
                    <IndianRupee className="w-3.5 h-3.5 inline mr-0.5 stroke-[2.5]" />
                    {(summary?.netBalance ?? 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Admin Portal Tab Button (Direct Access) */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs border transition cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-200'
                  }`}
                  title={isHindi ? 'व्यवस्थापक कक्ष' : 'Admin Panel'}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden xs:inline">{t('tabAdmin')}</span>
                  {pendingApprovals > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-black animate-pulse">
                      {pendingApprovals}
                    </span>
                  )}
                </button>
              )}

              {/* User Identity Chip with Dropdown Menu */}
              {currentUser && (
                <div ref={userMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(prev => !prev)}
                    className={`flex items-center gap-1.5 sm:gap-2 bg-slate-50 hover:bg-slate-100 border px-1.5 sm:px-2.5 py-1 rounded-xl transition text-left cursor-pointer active:scale-95 ${
                      isUserMenuOpen 
                        ? 'border-emerald-400 bg-emerald-50/60 ring-2 ring-emerald-500/20' 
                        : 'border-slate-200/80'
                    }`}
                    title={isHindi ? "खाता एवं रसीदें खोलें" : "Account & Receipts"}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0 ${
                      isAdmin ? 'bg-amber-600 shadow-xs shadow-amber-600/30' : 'bg-emerald-600'
                    }`}>
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left text-xs hidden sm:block">
                      <div className="font-bold text-slate-900 leading-tight max-w-[95px] truncate">{currentUser.name}</div>
                      <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <span>{isAdmin ? (isHindi ? 'व्यवस्थापक' : 'Admin') : (isHindi ? 'सदस्य' : 'Member')}</span>
                      </div>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                  </button>

                  {/* Organized User Dropdown (Holds My Receipts & Profile) */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* User Header Profile */}
                      <div className="px-4 py-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0 ${
                            isAdmin ? 'bg-amber-600 shadow-sm' : 'bg-emerald-600 shadow-sm'
                          }`}>
                            {currentUser.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-extrabold text-slate-900 text-sm truncate">{currentUser.name}</h4>
                            <p className="text-xs text-slate-500 truncate font-mono">
                              {currentUser.phone ? `+91 ${currentUser.phone}` : 'Committee Member'}
                            </p>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {isAdmin 
                                ? (isHindi ? '🛡️ मुख्य व्यवस्थापक (Admin)' : '🛡️ Committee Admin') 
                                : (isHindi ? '⭐ कोर सदस्य (Core Member)' : '⭐ Core Member')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Options */}
                      <div className="p-1.5 space-y-1">
                        {/* 1. My Receipts & Passbook (Organized Here) */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('my-ledger');
                            setIsUserMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition cursor-pointer ${
                            activeTab === 'my-ledger'
                              ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <UserCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-slate-900 font-extrabold flex items-center gap-1.5">
                              <span>{isHindi ? 'मेरी रसीदें एवं पासबुक' : 'My Receipts & Passbook'}</span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-100 text-emerald-800 font-bold">VIP</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {isHindi ? 'भुगतानों की रसीदें, मासिक पर्चियां व विवरण' : 'Verified vouchers, slips & contribution history'}
                            </div>
                          </div>
                        </button>

                        {/* 2. Admin Profile & PIN Edit (if Admin) */}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              onOpenAdminProfile?.();
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-900 transition cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                              <SettingsIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-slate-900 font-extrabold">
                                {isHindi ? 'व्यवस्थापक प्रोफाइल एवं पिन' : 'Admin Profile & PIN'}
                              </div>
                              <div className="text-[10px] text-slate-400 font-normal">
                                {isHindi ? 'नाम, मोबाइल और 4-अंकीय पिन बदलें' : 'Update name, mobile & 4-digit PIN'}
                              </div>
                            </div>
                          </button>
                        )}
                      </div>

                      {/* Logout Item */}
                      <div className="pt-1.5 mt-1 border-t border-slate-100 px-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{isHindi ? 'लॉगआउट करें (Sign Out)' : 'Sign Out'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation Tabs Bar (Clean, Uncluttered 5 Tabs + Admin) */}
          <nav className="hidden sm:flex items-center space-x-1 py-2 border-t border-slate-100 overflow-x-auto">
            {desktopTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
                    tab.highlight
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm hover:from-emerald-500 hover:to-teal-500'
                      : isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-slate-900 text-white'
                    : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>{t('tabAdmin')}</span>
                {pendingApprovals > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-black">
                    {pendingApprovals}
                  </span>
                )}
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Clean 5 Thumb-Friendly Tabs) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around">
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isHero) {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center justify-center -mt-5 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white w-12 h-12 rounded-2xl shadow-lg shadow-emerald-500/30 transition active:scale-90 cursor-pointer"
              >
                <Icon className="w-5 h-5 stroke-[2.5]" />
                <span className="text-[9px] font-black mt-0.5 leading-none">{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-0.5 leading-none">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
