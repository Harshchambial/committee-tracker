'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { 
  X, 
  IndianRupee, 
  Copy, 
  Check, 
  Smartphone, 
  ShieldCheck, 
  HelpCircle,
  AlertCircle,
  QrCode as QrCodeIcon,
  HeartHandshake,
  UserCheck,
  Tag,
  Sparkles
} from 'lucide-react';
import { Member, CommitteeSettings, ContributionType } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface PayDuesModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  settings: CommitteeSettings | null;
  initialMemberId?: string;
  initialMonth?: number;
  initialYear?: number;
  initialType?: ContributionType;
  onPaymentSuccess: () => void;
}

const COMMON_AMOUNTS = [250, 500, 1000, 2100, 5100];
const SUGGESTED_CAUSES_EN = [
  'Street Light Maintenance',
  'Road & Pavement Repair',
  'Drinking Water & Sanitation',
  'Park & Greenery Cleanup',
  'General Community Welfare'
];
const SUGGESTED_CAUSES_HI = [
  'स्ट्रीट लाइट मरम्मत',
  'सड़क एवं खड़ंजा मरम्मत',
  'पेयजल एवं स्वच्छता व्यवस्था',
  'पार्क एवं हरियाली सफाई',
  'आम जन सेवा एवं कल्याण'
];

export const PayDuesModal: React.FC<PayDuesModalProps> = ({
  isOpen,
  onClose,
  members,
  settings,
  initialMemberId,
  initialMonth,
  initialYear,
  initialType = 'CORE_MONTHLY',
  onPaymentSuccess
}) => {
  const { t, isHindi, getMonthName } = useLanguage();
  const currentDate = new Date();

  const [contributionType, setContributionType] = useState<ContributionType>(initialType);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  
  // Public Seva fields
  const [contributorName, setContributorName] = useState<string>('');
  const [contributorPhone, setContributorPhone] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('500');
  const [purpose, setPurpose] = useState<string>('');

  const [utrNumber, setUtrNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showUtrHelp, setShowUtrHelp] = useState(false);

  // Filter core members for monthly selector
  const coreMembers = members.filter(m => m.status === 'ACTIVE' && m.memberType !== 'VOLUNTARY');
  const prevIsOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      const initType = initialType || 'CORE_MONTHLY';
      setContributionType(initType);

      if (initialMemberId) {
        setSelectedMemberId(initialMemberId);
        setContributionType('CORE_MONTHLY');
      } else {
        const firstCore = members.find(m => m.status === 'ACTIVE' && m.memberType !== 'VOLUNTARY');
        if (firstCore) {
          setSelectedMemberId(firstCore.id);
        }
      }
      
      if (initialMonth) setSelectedMonth(initialMonth);
      if (initialYear) setSelectedYear(initialYear);

      setErrorMessage(null);
      setSuccessMessage(null);
      setUtrNumber('');
      setNotes('');
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, initialMemberId, initialMonth, initialYear, initialType, members]);

  // Dedicated Escape key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isCore = contributionType === 'CORE_MONTHLY';
  const selectedMember = members.find(m => m.id === selectedMemberId);
  const coreAmount = settings?.monthlyAmount || 1000;
  const currentAmount = isCore ? coreAmount : (parseFloat(customAmount) || 0);

  const upiId = settings?.upiId || 'samiti@upi';
  const payeeName = settings?.payeeName || settings?.committeeName || 'Narinder Singh';
  const monthName = getMonthName(selectedMonth);

  // Dynamic UPI URL for direct apps and QR code
  const notePayload = isCore 
    ? `COMM_${selectedMember?.name ? selectedMember.name.replace(/\s+/g, '') : 'CORE'}_${selectedMonth}_${selectedYear}`.slice(0, 25)
    : `SEVA_${contributorName ? contributorName.replace(/\s+/g, '') : 'SUPPORTER'}`.slice(0, 25);

  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${currentAmount}&cu=INR&tn=${encodeURIComponent(notePayload)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUtr = utrNumber.trim().replace(/\s+/g, '');
    if (!cleanUtr || cleanUtr.length < 6) {
      setErrorMessage(isHindi ? 'कृपया वैध 12-अंकों का UPI UTR / Reference नंबर दर्ज करें।' : 'Please enter a valid 12-digit UPI Reference / UTR Number.');
      return;
    }

    if (isCore) {
      if (!selectedMemberId) {
        setErrorMessage(isHindi ? 'कृपया सूची से सदस्य का नाम चुनें।' : 'Please select your name from the member list.');
        return;
      }
    } else {
      if (!contributorName.trim()) {
        setErrorMessage(isHindi ? 'कृपया रसीद हेतु अपना नाम दर्ज करें।' : 'Please enter your name for the receipt.');
        return;
      }
      if (!currentAmount || currentAmount <= 0) {
        setErrorMessage(isHindi ? 'कृपया वैध सहयोग राशि दर्ज करें।' : 'Please enter a valid contribution amount.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        amount: currentAmount,
        utrNumber: cleanUtr,
        paymentMethod: 'UPI_QR',
        notes: notes.trim(),
        contributionType
      };

      if (isCore) {
        payload.memberId = selectedMemberId;
        payload.month = selectedMonth;
        payload.year = selectedYear;
      } else {
        payload.contributorName = contributorName.trim();
        payload.contributorPhone = contributorPhone.trim();
        payload.purpose = purpose.trim() || 'General Welfare & Development';
      }

      const res = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit payment proof');

      confetti({ particleCount: 50, spread: 60 });
      setSuccessMessage(isHindi ? 'भुगतान रसीद सबमिट हो गई! व्यवस्थापक जल्द सत्यापित करेंगे।' : 'Payment proof submitted! Admin will verify shortly.');
      
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
        setSuccessMessage(null);
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestedCauses = isHindi ? SUGGESTED_CAUSES_HI : SUGGESTED_CAUSES_EN;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Sticky Header with Prominent Close Button */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="min-w-0 pr-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] sm:text-[11px] font-bold border border-emerald-200 mb-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>{t('payModalSubtitle')}</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
              {t('payModalTitle')}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 flex items-center justify-center transition cursor-pointer shrink-0 border border-slate-200 active:scale-95 shadow-2xs"
            aria-label={isHindi ? 'बंद करें' : 'Close'}
            title={isHindi ? 'बंद करें (Esc)' : 'Close (Esc)'}
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Dual Mode Switcher */}
          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setContributionType('CORE_MONTHLY');
                if (!selectedMemberId && coreMembers.length > 0) {
                  setSelectedMemberId(coreMembers[0].id);
                }
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-bold text-xs transition cursor-pointer active:scale-95 ${
                isCore 
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{isHindi ? 'कोर सदस्य मासिक' : 'Core Member'}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setContributionType('PUBLIC_SEVA');
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-bold text-xs transition cursor-pointer active:scale-95 ${
                !isCore 
                  ? 'bg-white text-orange-800 shadow-xs border border-slate-200' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span className="truncate">{isHindi ? 'जन सहयोग (खुला)' : 'Jan Sahayog'}</span>
            </button>
          </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-left">
          {/* OPTION A: Core Member Flow */}
          {isCore ? (
            <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('selectMember')}
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="">-- {isHindi ? 'सदस्य चुनें' : 'Select Core Member'} --</option>
                  {coreMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.phone ? `(${m.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t('selectMonth')}
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-xs sm:text-sm text-slate-900"
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                      <option key={m} value={m}>{getMonthName(m)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {isHindi ? 'वर्ष' : 'Year'}
                  </label>
                  <input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs sm:text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-900">{isHindi ? 'मासिक अंशदान राशि' : 'Monthly Fixed Amount'}</span>
                <span className="text-sm font-black text-emerald-700">₹{coreAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ) : (
            /* OPTION B: Jan Sahayog / Open Donation Flow */
            <div className="space-y-3 bg-orange-50/50 p-3.5 rounded-2xl border border-orange-200/70">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t('contributorName')}
                  </label>
                  <input
                    type="text"
                    placeholder={isHindi ? 'उदा. राकेश कुमार' : 'e.g. Rakesh Kumar'}
                    value={contributorName}
                    onChange={(e) => setContributorName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t('contributorPhone')}
                  </label>
                  <input
                    type="tel"
                    placeholder={isHindi ? 'उदा. 9876543210' : 'e.g. 9876543210'}
                    value={contributorPhone}
                    onChange={(e) => setContributorPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-xs sm:text-sm text-slate-900"
                  />
                </div>
              </div>

              {/* Amount Pills & Custom Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('contributionAmount')}
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {COMMON_AMOUNTS.map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCustomAmount(amt.toString())}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        customAmount === amt.toString()
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    required
                    placeholder="Enter any amount"
                    className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-300 bg-white font-black text-sm text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Purpose / Cause */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('purposeLabel')}
                </label>
                <input
                  type="text"
                  placeholder={t('purposePlaceholder')}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-xs sm:text-sm text-slate-900 mb-1.5"
                />
                <div className="flex flex-wrap gap-1">
                  {suggestedCauses.slice(0, 3).map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setPurpose(c)}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/90 text-slate-600 border border-slate-200 hover:bg-orange-50 cursor-pointer"
                    >
                      + {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Live Dynamic UPI QR & Payment Action Box */}
          <div className="bg-gradient-to-b from-slate-50 to-slate-100/70 p-4 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="flex flex-col items-center justify-center">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 inline-block">
                <QRCodeSVG
                  value={upiUri}
                  size={160}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <p className="text-[11px] font-bold text-slate-600 mt-2">
                {t('scanQrToPay')}
              </p>
              <div className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                <span className="text-sm font-bold mr-0.5">₹</span>
                {currentAmount.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Direct Mobile UPI Intent Button */}
            <a
              href={upiUri}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-98"
            >
              <Smartphone className="w-4 h-4" />
              <span>{t('openUpiApp')}</span>
            </a>

            {/* UPI ID Copy Bar */}
            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs">
              <span className="font-mono text-slate-600 font-bold truncate max-w-[210px]">{upiId}</span>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 cursor-pointer"
              >
                {copiedUpi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUpi ? t('copied') : t('copyUpiId')}</span>
              </button>
            </div>
          </div>

          {/* 12-Digit UTR Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                {t('enterUtrLabel')}
              </label>
              <button
                type="button"
                onClick={() => setShowUtrHelp(!showUtrHelp)}
                className="text-[10px] text-amber-700 hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                <HelpCircle className="w-3 h-3" />
                <span>{isHindi ? 'UTR कहां मिलेगा?' : 'Where is UTR?'}</span>
              </button>
            </div>

            <input
              type="text"
              placeholder="e.g. 605192847291"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
              maxLength={16}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-sm tracking-widest text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />

            {showUtrHelp && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                {t('utrHelpText')}
              </div>
            )}
          </div>

          {/* Error & Success Messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Submit and Cancel Button Row */}
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
              disabled={isSubmitting}
              className="w-full sm:w-2/3 py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? t('submitting') : t('btnSubmitProof')}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
);
};
