'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { 
  X, 
  IndianRupee, 
  Copy, 
  Check, 
  ExternalLink, 
  Smartphone, 
  ShieldCheck, 
  HelpCircle,
  AlertCircle
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

      // Celebrate with confetti
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center pb-5 border-b border-slate-100">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Zero-Fee Direct UPI Payment
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Pay Monthly Committee Dues
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Scan with any UPI app, pay ₹{amount}, and submit the 12-digit UTR
          </p>
        </div>

        {successMessage ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <h3 className="text-xl font-bold text-slate-900">Payment Submitted!</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Your 12-digit UTR has been logged. Once the Admin verifies it in the bank statement, your status will turn <strong className="text-emerald-700">Green (Verified)</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 pt-5">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Member & Month Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Member *
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  required
                  className="w-full text-xs sm:text-sm font-medium rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payment For Month *
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                    className="w-full text-xs sm:text-sm font-medium rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {MONTHS.map((m, idx) => (
                      <option key={m} value={idx + 1}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                    className="w-24 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dynamic UPI QR Code Card */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/90 flex flex-col items-center text-center">
              <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200">
                <QRCodeSVG
                  value={upiUri}
                  size={168}
                  level="M"
                  includeMargin={false}
                />
              </div>

              <div className="mt-3 flex items-center justify-center gap-1 text-emerald-700 font-extrabold text-lg">
                <IndianRupee className="w-5 h-5 stroke-[2.5]" />
                <span>{amount.toLocaleString('en-IN')}</span>
                <span className="text-xs font-bold text-slate-500 ml-1">
                  for {monthName} {selectedYear}
                </span>
              </div>

              {/* Direct UPI Intent Button for Mobile */}
              <a
                href={upiUri}
                className="sm:hidden mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
              >
                <Smartphone className="w-4 h-4" />
                Open GPay / PhonePe / Paytm
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* UPI ID Copy row */}
              <div className="mt-3 flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600">
                <span className="font-mono font-medium">{upiId}</span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* 12-Digit UTR Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  12-Digit UTR / UPI Reference No. *
                </label>
                <button
                  type="button"
                  onClick={() => setShowUtrHelp(!showUtrHelp)}
                  className="text-[11px] text-emerald-700 hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Where to find UTR?
                </button>
              </div>

              {showUtrHelp && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                  <p className="font-bold">How to find your 12-digit UTR:</p>
                  <p>• <strong>Google Pay:</strong> Tap payment details → Look for &quot;UPI transaction ID&quot; (starts with digits like 601...)</p>
                  <p>• <strong>PhonePe:</strong> Tap History → View Transaction → Look for &quot;UTR: 12 digits&quot;</p>
                  <p>• <strong>Paytm:</strong> Tap Passbook/History → Look for &quot;UPI Ref No&quot;</p>
                </div>
              )}

              <input
                type="text"
                placeholder="e.g. 601827491823"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                required
                maxLength={20}
                className="w-full text-base font-mono font-bold tracking-widest rounded-xl border border-slate-300 p-3 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:tracking-normal placeholder:font-sans placeholder:text-xs placeholder:font-normal"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                This 12-digit number proves your bank transfer and prevents duplicate claims.
              </p>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Additional Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Paid from HDFC Bank account of brother"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-600/25 transition cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying & Submitting...' : 'Submit Payment Proof (₹1,000)'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
