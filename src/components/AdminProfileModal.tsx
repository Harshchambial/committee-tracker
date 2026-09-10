'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  UserCheck, 
  ShieldCheck, 
  KeyRound, 
  Phone, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AuthUser } from '@/types';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminPin: string;
  currentUser: AuthUser | null;
  settingsPhone?: string;
  onProfileUpdated: (updatedUser: AuthUser, newPin?: string) => void;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose,
  adminPin,
  currentUser,
  settingsPhone,
  onProfileUpdated
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || settingsPhone || '');
  const [pinVerification, setPinVerification] = useState(adminPin || '');
  
  // Password change toggle
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync props when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(currentUser?.name || '');
      setPhone(currentUser?.phone || settingsPhone || '');
      setPinVerification(adminPin || '');
      setNewPin('');
      setConfirmPin('');
      setShowPasswordChange(false);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, currentUser, settingsPhone, adminPin]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMessage('Admin name is required.');
      return;
    }

    const currentPinToUse = pinVerification.trim() || adminPin.trim();
    if (!currentPinToUse) {
      setErrorMessage('Please enter your current Admin PIN to confirm changes.');
      return;
    }

    if (showPasswordChange) {
      if (newPin.trim().length < 4) {
        setErrorMessage('New PIN / password must be at least 4 characters/digits.');
        return;
      }
      if (newPin.trim() !== confirmPin.trim()) {
        setErrorMessage('New PIN and confirmation PIN do not match.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPin: currentPinToUse,
          name: cleanName,
          phone: phone.trim(),
          newPin: showPasswordChange ? newPin.trim() : undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update profile');
      }

      confetti({ particleCount: 50, spread: 60 });
      setSuccessMessage('Admin profile updated successfully!');

      const updatedUser: AuthUser = {
        name: cleanName,
        phone: phone.trim(),
        role: 'ADMIN'
      };

      onProfileUpdated(updatedUser, data.newPin);

      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2.5 shadow-xs">
            <UserCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Admin Profile Settings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Update your father&apos;s name, phone, and login password
          </p>
        </div>

        {successMessage ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-slate-900">{successMessage}</h3>
            <p className="text-xs text-slate-500">Saving and closing...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Admin Name Field */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin / Organizer Name *</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Narinder Singh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                This name appears on the header bar, verified payment stamps, and official receipts.
              </p>
            </div>

            {/* Admin Phone Field */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Admin Mobile Number (Optional)</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            {/* Current PIN verification */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Current Admin PIN *</span>
              </label>
              <input
                type={showPasswordText ? 'text' : 'password'}
                placeholder="Enter current PIN (e.g. 1234)"
                value={pinVerification}
                onChange={(e) => setPinVerification(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            {/* Change PIN toggle button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  <span>Also Change Admin Password / PIN?</span>
                </span>
                {showPasswordChange ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>
            </div>

            {/* Collapsible New PIN Fields */}
            {showPasswordChange && (
              <div className="space-y-3 p-3 bg-amber-50/50 rounded-2xl border border-amber-200/70 animate-in fade-in slide-in-from-top-2 duration-150">
                <div>
                  <label className="block text-[10px] font-bold text-amber-900 uppercase mb-1">
                    New PIN / Password *
                  </label>
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    placeholder="Enter new 4+ character password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white font-mono text-xs focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-amber-900 uppercase mb-1">
                    Confirm New PIN *
                  </label>
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    placeholder="Re-type new password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white font-mono text-xs focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showPasswordText}
                  onChange={(e) => setShowPasswordText(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-0 cursor-pointer"
                />
                <span>Show password digits</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-2/3 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs tracking-wide shadow-md transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Save Admin Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
