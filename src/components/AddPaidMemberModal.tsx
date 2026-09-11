'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  UserCheck, 
  ShieldCheck, 
  IndianRupee, 
  Phone, 
  User, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  UserPlus, 
  Receipt, 
  ArrowRight,
  Sparkles,
  Plus
} from 'lucide-react';
import { Member, CommitteeSettings, PaymentRecord, ContributionType } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface AddPaidMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminPin: string;
  settings: CommitteeSettings | null;
  onMemberAdded: () => void;
  onViewReceipt?: (payment: PaymentRecord) => void;
}

export const AddPaidMemberModal: React.FC<AddPaidMemberModalProps> = ({
  isOpen,
  onClose,
  adminPin,
  settings,
  onMemberAdded,
  onViewReceipt
}) => {
  const { isHindi, getMonthName } = useLanguage();
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [memberType, setMemberType] = useState<'CORE' | 'VOLUNTARY'>('CORE');
  const [role, setRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [notes, setNotes] = useState('');

  // Payment Fields (Default TRUE because user specified: "5-6 people already sent money to my father")
  const [hasPaid, setHasPaid] = useState(true);
  const [paidAmount, setPaidAmount] = useState<number>(settings?.monthlyAmount || 1000);
  const [paidMonth, setPaidMonth] = useState<number>(new Date().getMonth() + 1);
  const [paidYear, setPaidYear] = useState<number>(new Date().getFullYear());
  const [paidMethod, setPaidMethod] = useState<'CASH' | 'UPI_QR' | 'BANK_TRANSFER'>('CASH');
  const [paidNotes, setPaidNotes] = useState('');

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdPayment, setCreatedPayment] = useState<PaymentRecord | null>(null);
  const [lastAddedName, setLastAddedName] = useState('');
  const [batchCount, setBatchCount] = useState(0);

  // Focus name input when modal opens or resets
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset form for next entry
  const resetForNext = () => {
    setName('');
    setPhone('');
    setNotes('');
    setPaidNotes('');
    setCreatedPayment(null);
    setErrorMessage(null);
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = name.trim();
    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);

    if (!cleanName) {
      setErrorMessage(isHindi ? 'कृपया सदस्य का पूरा नाम दर्ज करें।' : 'Please enter the member full name.');
      return;
    }

    if (cleanPhone.length < 10) {
      setErrorMessage(isHindi ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (hasPaid && (!paidAmount || paidAmount <= 0)) {
      setErrorMessage(isHindi ? 'कृपया भुगतान की गई मान्य राशि दर्ज करें।' : 'Please enter a valid payment amount.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
          role,
          memberType,
          notes: notes.trim(),
          adminPin,
          hasPaid,
          paidMonth,
          paidYear,
          paidAmount: Number(paidAmount),
          paidMethod,
          paidContributionType: memberType === 'CORE' ? 'CORE_MONTHLY' : 'PUBLIC_SEVA',
          paidPurpose: memberType === 'VOLUNTARY' ? (isHindi ? 'जन सहयोग (ऐच्छिक योगदान)' : 'Jan Sahayog Public Contribution') : undefined,
          paidNotes: paidNotes.trim() || (paidMethod === 'CASH' 
            ? (isHindi ? `${settings?.adminName || 'पिताजी'} को नकद प्राप्त हुआ` : `Cash received by ${settings?.adminName || 'Admin'}`)
            : (isHindi ? 'ऑनलाइन भुगतान प्राप्त हुआ' : 'Online payment received'))
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (isHindi ? 'सदस्य जोड़ने में त्रुटि हुई।' : 'Failed to add member.'));

      confetti({ particleCount: 50, spread: 65 });
      setLastAddedName(cleanName);
      setBatchCount(prev => prev + 1);

      if (data.payment) {
        setCreatedPayment(data.payment);
      } else {
        onMemberAdded();
        resetForNext();
      }

      onMemberAdded();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 relative my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black shadow-xs">
              <UserPlus className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>{isHindi ? 'त्वरित प्रविष्टि (Quick Entry)' : 'Fast Member Registration'}</span>
                {batchCount > 0 && (
                  <span className="ml-1 bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded-full">
                    {batchCount} {isHindi ? 'जोड़े गए' : 'added'}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {isHindi ? 'नया सदस्य एवं प्राप्त भुगतान जोड़ें' : 'Add Member & Received Payment'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 flex items-center justify-center transition cursor-pointer border border-slate-200 active:scale-95 shadow-2xs"
            aria-label={isHindi ? 'बंद करें' : 'Close'}
            title={isHindi ? 'बंद करें (Esc)' : 'Close (Esc)'}
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Post-Registration Success Banner */}
          {createdPayment ? (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-black text-emerald-950">
                  {isHindi ? `"${lastAddedName}" का भुगतान दर्ज हो गया!` : `Recorded payment for "${lastAddedName}"!`}
                </h3>
                <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                  ₹{createdPayment.amount.toLocaleString('en-IN')} • {getMonthName(createdPayment.month)} {createdPayment.year} • {isHindi ? 'सत्यापित डिजिटल रसीद तैयार है' : 'Verified Digital Receipt Ready'}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                {onViewReceipt && (
                  <button
                    type="button"
                    onClick={() => {
                      onViewReceipt(createdPayment);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-emerald-300 text-emerald-800 font-bold text-xs hover:bg-emerald-100 flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <Receipt className="w-4 h-4 text-emerald-700" />
                    <span>{isHindi ? 'रसीद देखें / व्हाट्सएप भेजें' : 'View & Share Receipt'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={resetForNext}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{isHindi ? 'अगला व्यक्ति जोड़ें' : 'Add Next Person'}</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Informative Help Banner for Father */}
              <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs text-blue-900 leading-relaxed flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">
                    {isHindi ? 'जिन्होंने पैसे दे दिए हैं, उनका विवरण यहाँ तुरंत भरें:' : 'Quickly record details of people who have already paid:'}
                  </span>
                  <span className="text-[11px] text-blue-800">
                    {isHindi 
                      ? 'नाम और 10 अंकों का फोन नंबर अनिवार्य है। भुगतान स्वतः सत्यापित होकर तुरंत डिजिटल रसीद बन जाएगी।' 
                      : 'Full Name and 10-digit Phone are mandatory. Payment will be auto-verified and receipt generated immediately.'}
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. Mandatory Name Field */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isHindi ? 'सदस्य का पूरा नाम *' : 'Member Full Name *'}</span>
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  placeholder={isHindi ? 'जैसे: कुलदीप सिंह / नरेश कुमार' : 'e.g. Kuldeep Singh / Naresh Kumar'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* 2. Mandatory 10-Digit Mobile Number */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isHindi ? 'मोबाइल नंबर (10 अंक) *' : 'Mobile Number (10 Digits) *'}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {phone.replace(/\D/g, '').length}/10
                  </span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9812345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                    phone.replace(/\D/g, '').length === 10 ? 'border-emerald-400 bg-emerald-50/20' : 'border-slate-300'
                  }`}
                />
              </div>

              {/* 3. Membership Category Switcher */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isHindi ? 'सदस्यता प्रकार (Category)' : 'Membership Category'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMemberType('CORE');
                      if (hasPaid) setPaidAmount(settings?.monthlyAmount || 1000);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col ${
                      memberType === 'CORE'
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-black">⭐ {isHindi ? 'कोर सदस्य (नियमित)' : 'Core Member'}</span>
                    <span className="text-[10px] text-slate-500">{isHindi ? '₹1,000 प्रति माह' : '₹1,000 / month'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMemberType('VOLUNTARY');
                      if (hasPaid && paidAmount === 1000) setPaidAmount(500);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col ${
                      memberType === 'VOLUNTARY'
                        ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/20 text-orange-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-black">🤝 {isHindi ? 'जन सहयोग (स्वैच्छिक)' : 'Jan Sahayog'}</span>
                    <span className="text-[10px] text-slate-500">{isHindi ? 'ऐच्छिक राशि / सार्वजनिक' : 'Voluntary Any Amount'}</span>
                  </button>
                </div>
              </div>

              {/* 4. Payment Details Section (Pre-expanded by default) */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hasPaid}
                      onChange={(e) => setHasPaid(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-black text-emerald-950">
                      {isHindi ? 'भुगतान प्राप्त हो गया है (Already Paid)' : 'Has Already Paid Money'}
                    </span>
                  </label>
                  <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                    {isHindi ? 'स्वतः रसीद बनेगी' : 'Instant Receipt'}
                  </span>
                </div>

                {hasPaid && (
                  <div className="space-y-3 pt-2 border-t border-emerald-200 animate-in fade-in duration-150">
                    {/* Amount Paid Field */}
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-900 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>{isHindi ? 'भुगतान की गई राशि (Amount Paid) *' : 'Amount Paid (₹) *'}</span>
                        <div className="flex items-center gap-1">
                          {[500, 1000, 2000].map(amt => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setPaidAmount(amt)}
                              className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                                paidAmount === amt 
                                  ? 'bg-emerald-700 text-white' 
                                  : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                              }`}
                            >
                              ₹{amt}
                            </button>
                          ))}
                        </div>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                        <input
                          type="number"
                          placeholder="1000"
                          value={paidAmount || ''}
                          onChange={(e) => setPaidAmount(Number(e.target.value))}
                          min={1}
                          required
                          className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-emerald-300 bg-white font-mono font-black text-base text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Method, Month and Year */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-900 uppercase mb-0.5">
                          {isHindi ? 'भुगतान विधि' : 'Payment Method'}
                        </label>
                        <select
                          value={paidMethod}
                          onChange={(e) => setPaidMethod(e.target.value as any)}
                          className="w-full p-2 bg-white rounded-xl border border-emerald-300 text-xs font-bold text-slate-800"
                        >
                          <option value="CASH">{isHindi ? '💵 नकद (Cash to Father)' : '💵 Cash'}</option>
                          <option value="UPI_QR">{isHindi ? '📱 UPI / PhonePe / GPay' : '📱 UPI / GPay'}</option>
                          <option value="BANK_TRANSFER">{isHindi ? '🏦 बैंक ट्रांसफर' : '🏦 Bank Transfer'}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-emerald-900 uppercase mb-0.5">
                          {isHindi ? 'माह (Month)' : 'Month'}
                        </label>
                        <select
                          value={paidMonth}
                          onChange={(e) => setPaidMonth(Number(e.target.value))}
                          className="w-full p-2 bg-white rounded-xl border border-emerald-300 text-xs font-bold text-slate-800"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                            <option key={m} value={m}>{getMonthName(m)}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-emerald-900 uppercase mb-0.5">
                          {isHindi ? 'वर्ष (Year)' : 'Year'}
                        </label>
                        <input
                          type="number"
                          value={paidYear}
                          onChange={(e) => setPaidYear(Number(e.target.value))}
                          className="w-full p-2 bg-white rounded-xl border border-emerald-300 text-xs font-bold text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Receipt Note */}
                    <div>
                      <label className="block text-[10px] font-bold text-emerald-900 uppercase mb-0.5">
                        {isHindi ? 'रसीद टिप्पणी / संदर्भ (वैकल्पिक)' : 'Notes / Reference (Optional)'}
                      </label>
                      <input
                        type="text"
                        placeholder={isHindi ? 'जैसे: नरिंदर सिंह जी को नकद दिया / GPay किया' : 'e.g. Paid cash to Narinder Singh'}
                        value={paidNotes}
                        onChange={(e) => setPaidNotes(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white rounded-xl border border-emerald-300 text-xs text-slate-800"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Address / Notes (Optional) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isHindi ? 'पता / पहचान टिप्पणी (वैकल्पिक)' : 'Address / Notes (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={isHindi ? 'जैसे: मकान नं. 24, गली 2' : 'e.g. House No. 24, Street 2'}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-1/3 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition cursor-pointer text-center"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-2/3 py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-700/20 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span>{isHindi ? 'दर्ज किया जा रहा है...' : 'Saving...'}</span>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>
                        {hasPaid 
                          ? (isHindi ? `सदस्य जोड़ें एवं ₹${paidAmount || 1000} दर्ज करें` : `Add Member & Record ₹${paidAmount || 1000}`)
                          : (isHindi ? 'सदस्य जोड़ें' : 'Add Member')}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
