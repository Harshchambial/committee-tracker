'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Shield, 
  Lock, 
  User, 
  Phone, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Languages
} from 'lucide-react';
import { AuthUser, CommitteeSettings } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface LoginScreenProps {
  settings: CommitteeSettings | null;
  onLoginSuccess: (user: AuthUser, adminSecret?: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  settings,
  onLoginSuccess
}) => {
  const { language, toggleLanguage, isHindi } = useLanguage();
  const [loginRole, setLoginRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');

  // Member form fields
  const [memberName, setMemberName] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberEmail, setMemberEmail] = useState('');

  // Admin form fields
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleMemberLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = memberPhone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter your 10-digit registered mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'MEMBER',
          phone: cleanPhone,
          name: memberName,
          email: memberEmail
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed. Please check your mobile number.');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!adminPassword.trim()) {
      setErrorMessage('Please enter the Admin Password / PIN.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ADMIN',
          password: adminPassword.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Incorrect Admin Password / PIN.');
      }

      onLoginSuccess(data.user, adminPassword.trim());
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Language Switcher in top right */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleLanguage}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition cursor-pointer backdrop-blur-xs shadow-lg"
        >
          <Languages className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'hi' ? 'English' : '🇮🇳 हिन्दी'}</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Brand Icon */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 mb-3">
          <Building2 className="w-8 h-8 stroke-[2.5]" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          {settings?.committeeName || (isHindi ? 'विकास सहयोग समिति' : 'Vikas Sahayog Samiti')}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-xs mx-auto">
          {isHindi 
            ? 'निजी एवं सुरक्षित समिति पोर्टल। केवल पंजीकृत सदस्य ही बहीखाता देख सकते हैं।' 
            : 'Private & Protected Committee Portal. Only registered members can access ledger data.'}
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
          {/* Role Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginRole('MEMBER');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                loginRole === 'MEMBER'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              {isHindi ? 'सदस्य लॉगिन' : 'Member Login'}
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginRole('ADMIN');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                loginRole === 'ADMIN'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              {isHindi ? 'व्यवस्थापक पोर्टल' : 'Admin Portal'}
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* MEMBER LOGIN FORM */}
          {loginRole === 'MEMBER' && (
            <form onSubmit={handleMemberLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isHindi ? 'पंजीकृत मोबाइल नंबर *' : 'Registered Mobile Number *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs sm:text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    placeholder="9876543210"
                    value={memberPhone}
                    onChange={(e) => setMemberPhone(e.target.value.replace(/\D/g, ''))}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 font-mono font-bold text-base focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {isHindi ? 'समिति में पंजीकृत 10-अंकों का मोबाइल नंबर दर्ज करें' : 'Enter the phone number registered with the committee'}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isHindi ? 'आपका नाम (वैकल्पिक)' : 'Your Name (Optional)'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={isHindi ? 'जैसे: रमेश गुप्ता' : 'e.g. Ramesh Gupta'}
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isHindi ? 'ईमेल पता (वैकल्पिक)' : 'Email Address (Optional)'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="e.g. ramesh@gmail.com"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || memberPhone.length < 10}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? (isHindi ? 'सत्यापित हो रहा है...' : 'Verifying Membership...') : (isHindi ? 'समिति पोर्टल में प्रवेश करें' : 'Enter Committee Portal')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ADMIN LOGIN FORM */}
          {loginRole === 'ADMIN' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isHindi ? 'व्यवस्थापक पासवर्ड / पिन *' : 'Admin Secret Password / PIN *'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isHindi ? 'पिन दर्ज करें' : 'Enter Admin PIN or Password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-300 font-mono font-bold text-base focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {isHindi ? 'डिफ़ॉल्ट प्रारंभिक पिन है' : 'Default initial PIN is'} <strong className="font-mono text-slate-700">1234</strong>
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !adminPassword}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? (isHindi ? 'खोल रहा है...' : 'Unlocking Panel...') : (isHindi ? 'व्यवस्थापक पैनल खोलें' : 'Unlock Admin Panel')}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </button>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center space-y-1 text-xs text-slate-400">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            {isHindi ? 'पूर्णतः सुरक्षित एवं निजी' : 'End-to-End Privacy Protected'}
          </p>
          <p className="text-[11px] text-slate-500">
            {isHindi ? 'सदस्यता हेतु समिति व्यवस्थापक से संपर्क कर अपना नंबर जुड़वाएं।' : 'Want to join? Contact committee organizer to register your phone number.'}
          </p>
        </div>
      </div>
    </div>
  );
};
