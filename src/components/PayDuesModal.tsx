'use client';

import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Member, CommitteeSettings } from '@/types';

interface PayDuesModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  settings: CommitteeSettings | null;
  initialMemberId?: string;
  initialMonth?: number;
  initialYear?: number;
  onPaymentSuccess: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const PayDuesModal: React.FC<PayDuesModalProps> = ({
  isOpen,
  onClose,
  members,
  settings,
  initialMemberId,
  initialMonth,
  initialYear,
  onPaymentSuccess
}) => {
  const currentDate = new Date();
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showUtrHelp, setShowUtrHelp] = useState(false);
  const [showQrCode, setShowQrCode] = useState(true);

  useEffect(() => {
    if (isOpen) {
      if (initialMemberId) setSelectedMemberId(initialMemberId);
      else if (members.length > 0 && !selectedMemberId) setSelectedMemberId(members[0].id);
      
      if (initialMonth) setSelectedMonth(initialMonth);
      if (initialYear) setSelectedYear(initialYear);

      setErrorMessage(null);
      setSuccessMessage(null);
      setUtrNumber('');
      setNotes('');
    }
  }, [isOpen, initialMemberId, initialMonth, initialYear, members]);

  if (!isOpen) return null;

  const selectedMember = members.find(m => m.id === selectedMemberId);
  const amount = settings?.monthlyAmount || 1000;
  const upiId = settings?.upiId || 'samiti@upi';
  const payeeName = settings?.payeeName || settings?.committeeName || 'Committee Fund';
  const monthName = MONTHS[selectedMonth - 1];

  // Dynamic UPI URL for direct apps and QR code
  const notePayload = `COMM_${selectedMember?.name ? selectedMember.name.replace(/\s+/g, '') : 'MEM'}_${monthName}_${selectedYear}`.slice(0, 25);
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(notePayload)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUtr = utrNumber.trim().replace(/\s+/g, '');
    if (!selectedMemberId) {
      setErrorMessage('Please select your name from the member list.');
      return;
    }
    if (!cleanUtr || cleanUtr.length < 6) {
      setErrorMessage('Please enter a valid 12-digit UPI Reference / UTR Number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedMemberId,
          month: selectedMonth,
          year: selectedYear,
          amount,
          utrNumber: cleanUtr,
          notes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit payment proof');
      }

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSuccessMessage('Payment submitted successfully! Admin will verify your UTR shortly.');
      onPaymentSuccess();
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200">
        {/* Mobile Pull Bar */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center pb-4 border-b border-slate-100">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 mb-1">
            <ShieldCheck className="w-3 h-3" />
            Direct Bank UPI Transfer (₹0 Fees)
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
            Pay ₹{amount.toLocaleString('en-IN')} Contribution
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            For {monthName} {selectedYear} • {payeeName}
          </p>
        </div>

        {successMessage ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-black">
              ✓
            </div>
            <h3 className="text-lg font-bold text-slate-900">Payment Submitted!</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Your 12-digit UTR has been logged. Status will turn <strong className="text-emerald-700">Green (Verified)</strong> once approved.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Member & Month Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Select Your Name *
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  required
                  className="w-full text-xs font-semibold rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white"
                >
                  <option value="" disabled>-- Choose Your Name --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Month & Year *
                </label>
                <div className="flex gap-1.5">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                    className="w-full text-xs font-semibold rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white"
                  >
                    {MONTHS.map((m, idx) => (
                      <option key={m} value={idx + 1}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                    className="w-20 text-xs font-semibold rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white"
                  >
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                  </select>
                </div>
              </div>
            </div>

            {/* HERO PAYMENT ACTION (For Phone Users) */}
            <div className="space-y-2">
              <a
                href={upiUri}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transform active:scale-98 transition text-center"
              >
                <Smartphone className="w-5 h-5 stroke-[2.5]" />
                <span>Pay ₹{amount.toLocaleString('en-IN')} via GPay / PhonePe / Paytm</span>
              </a>
              <p className="text-[11px] text-center text-slate-500 font-medium">
                Tap above to open your UPI app directly on your phone
              </p>
            </div>

            {/* QR CODE & UPI ID (Expandable / Toggleable) */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowQrCode(!showQrCode)}
                className="w-full p-3 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <QrCodeIcon className="w-4 h-4 text-emerald-600" />
                  Or Scan QR Code / Copy UPI ID
                </span>
                {showQrCode ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {showQrCode && (
                <div className="p-4 pt-1 flex flex-col items-center border-t border-slate-200/60 text-center">
                  <div className="bg-white p-3 rounded-2xl shadow-xs border border-slate-200 my-2">
                    <QRCodeSVG
                      value={upiUri}
                      size={150}
                      level="M"
                      includeMargin={false}
                    />
                  </div>

                  <div className="mt-1 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 max-w-full">
                    <span className="font-mono font-bold truncate">{upiId}</span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="text-emerald-700 font-bold flex items-center gap-0.5 shrink-0 ml-1"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 12-Digit UTR Input */}
            <div className="bg-emerald-50/40 p-3.5 rounded-2xl border border-emerald-200/80">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  Step 2: Enter 12-Digit UTR No. *
                </label>
                <button
                  type="button"
                  onClick={() => setShowUtrHelp(!showUtrHelp)}
                  className="text-[11px] text-emerald-700 hover:underline flex items-center gap-0.5 font-bold"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Where is it?
                </button>
              </div>

              {showUtrHelp && (
                <div className="mb-2 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 space-y-0.5 leading-relaxed">
                  <p>• <strong>Google Pay:</strong> Payment details $\rightarrow$ &quot;UPI transaction ID&quot;</p>
                  <p>• <strong>PhonePe:</strong> View History $\rightarrow$ Details $\rightarrow$ &quot;UTR: 12 digits&quot;</p>
                  <p>• <strong>Paytm:</strong> Passbook $\rightarrow$ &quot;UPI Ref No&quot;</p>
                </div>
              )}

              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Paste 12-digit UTR (e.g. 601827491823)"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9]/g, ''))}
                required
                maxLength={16}
                className="w-full text-base font-mono font-black tracking-widest rounded-xl border border-slate-300 p-2.5 bg-white text-center focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm tracking-wide shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Payment Proof (Confirm ₹1,000)'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
