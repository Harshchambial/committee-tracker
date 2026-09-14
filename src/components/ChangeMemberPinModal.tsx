'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { AuthUser } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface ChangeMemberPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onPinChanged?: () => void;
}

export const ChangeMemberPinModal: React.FC<ChangeMemberPinModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPinChanged
}) => {
  const { isHindi } = useLanguage();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanCurrent = currentPin.trim();
    const cleanNew = newPin.trim();
    const cleanConfirm = confirmPin.trim();

    if (!cleanCurrent) {
      setErrorMessage(isHindi ? 'कृपया वर्तमान पिन दर्ज करें (डिफ़ॉल्ट 1234 है)।' : 'Please enter your current PIN (default is 1234).');
      return;
    }

    if (!/^\d{4}$/.test(cleanNew)) {
      setErrorMessage(isHindi ? 'नया पिन ठीक 4 अंकों का होना चाहिए।' : 'New PIN must be exactly 4 digits.');
      return;
    }

    if (cleanNew !== cleanConfirm) {
      setErrorMessage(isHindi ? 'नया पिन और पुष्टि पिन मेल नहीं खाते।' : 'New PIN and confirm PIN do not match.');
      return;
    }

    if (cleanCurrent === cleanNew) {
      setErrorMessage(isHindi ? 'नया पिन वर्तमान पिन से अलग होना चाहिए।' : 'New PIN must be different from current PIN.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/change-member-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: currentUser.id,
          currentPin: cleanCurrent,
          newPin: cleanNew
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || (isHindi ? 'पिन बदलने में विफल' : 'Failed to change PIN'));
      }

      confetti({ particleCount: 50, spread: 60 });
      setSuccessMessage(isHindi ? 'आपका लॉगिन पिन सफलतापूर्वक बदल गया है!' : 'Your login PIN has been updated successfully!');
      onPinChanged?.();

      setTimeout(() => {
        onClose();
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        setSuccessMessage(null);
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 my-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 flex items-center justify-center transition cursor-pointer border border-slate-200"
          title={isHindi ? 'बंद करें' : 'Close'}
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        <div className="text-center pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2.5 shadow-xs">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            {isHindi ? 'लॉगिन पिन बदलें' : 'Change Login PIN'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentUser.name} (+91 {currentUser.phone})
          </p>
        </div>

        {successMessage ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="text-sm font-bold text-slate-900">{successMessage}</h3>
            <p className="text-xs text-slate-500">{isHindi ? 'खिड़की बंद हो रही है...' : 'Closing...'}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
              💡 {isHindi 
                ? 'यदि आपने पहले पिन नहीं बदला है, तो आपका वर्तमान पिन 1234 है।' 
                : 'If you have not changed your PIN yet, your default PIN is 1234.'}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                {isHindi ? 'वर्तमान 4-अंकीय पिन *' : 'Current 4-Digit PIN *'}
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="1234"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-sm tracking-widest text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                {isHindi ? 'नया 4-अंकीय पिन *' : 'New 4-Digit PIN *'}
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-sm tracking-widest text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                {isHindi ? 'नए पिन की पुष्टि करें *' : 'Confirm New PIN *'}
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-sm tracking-widest text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isLoading || newPin.length !== 4 || confirmPin.length !== 4}
                className="w-2/3 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs tracking-wide shadow-md transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isLoading ? (isHindi ? 'सहेज रहे हैं...' : 'Updating...') : (isHindi ? 'पिन सहेजें' : 'Save PIN')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
