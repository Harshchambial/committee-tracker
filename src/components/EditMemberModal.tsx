'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, UserCheck, ShieldCheck, AlertCircle, Phone, User, CheckCircle2 } from 'lucide-react';
import { Member } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  adminPin: string;
  onMemberUpdated: () => void;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  onClose,
  member,
  adminPin,
  onMemberUpdated
}) => {
  const { isHindi } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [memberType, setMemberType] = useState<'CORE' | 'VOLUNTARY'>('CORE');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (member && isOpen) {
      setName(member.name || '');
      setPhone(member.phone || '');
      setRole(member.role || 'MEMBER');
      setMemberType(member.memberType || 'CORE');
      setStatus(member.status || 'ACTIVE');
      setNotes(member.notes || '');
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = name.trim();
    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);

    if (!cleanName) {
      setErrorMessage('Member full name is required.');
      return;
    }

    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: member.id,
          name: cleanName,
          phone: cleanPhone,
          role,
          memberType,
          status,
          notes: notes.trim(),
          adminPin
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (isHindi ? 'सदस्य विवरण अपडेट करने में विफल' : 'Failed to update member'));

      confetti({ particleCount: 40, spread: 50 });
      setSuccessMessage(isHindi ? `"${cleanName}" का विवरण अपडेट हो गया!` : `Updated details for "${cleanName}"!`);
      onMemberUpdated();

      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2.5 shadow-xs">
            <UserCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {isHindi ? 'सदस्य प्रोफाइल संपादित करें' : 'Edit Member Profile'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isHindi ? 'नाम, फोन, सदस्यता प्रकार या स्थिति बदलें' : 'Update name, phone number, member type or status'}
          </p>
        </div>

        {successMessage ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-slate-900">{successMessage}</h3>
            <p className="text-xs text-slate-500">{isHindi ? 'डेटा अपडेट हो रहा है...' : 'Updating directory...'}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>{isHindi ? 'पूरा नाम *' : 'Full Name *'}</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{isHindi ? 'मोबाइल नंबर (10 अंक) *' : 'Phone Number (10 Digits) *'}</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                maxLength={10}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Membership Type: Core vs Public Contributor */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                {isHindi ? 'सदस्यता प्रकार (योगदान श्रेणी)' : 'Membership Category'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMemberType('CORE')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col ${
                    memberType === 'CORE'
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-black">
                    {isHindi ? '⭐ कोर सदस्य' : '⭐ Core Member'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    {isHindi ? '₹1,000 / माह (12-माह मैट्रिक्स)' : '₹1,000/mo (Monthly Matrix)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMemberType('VOLUNTARY')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col ${
                    memberType === 'VOLUNTARY'
                      ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-black">
                    {isHindi ? '🤝 जन सहयोग' : '🤝 Public Contributor'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    {isHindi ? 'ऐच्छिक सहयोग (खुला कोष)' : 'Voluntary (As per will)'}
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  {isHindi ? 'भूमिका (Role)' : 'Role'}
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white"
                >
                  <option value="MEMBER">{isHindi ? 'सदस्य' : 'Member'}</option>
                  <option value="ADMIN">{isHindi ? 'व्यवस्थापक (Admin)' : 'Admin / Organizer'}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  {isHindi ? 'स्थिति (Status)' : 'Status'}
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white"
                >
                  <option value="ACTIVE">{isHindi ? 'सक्रिय (Active)' : 'Active'}</option>
                  <option value="INACTIVE">{isHindi ? 'निष्क्रिय (Inactive)' : 'Inactive'}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Notes / Address (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Flat 302 / Shop 4"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
              />
            </div>

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
                {isLoading ? 'Saving...' : 'Save Member Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
