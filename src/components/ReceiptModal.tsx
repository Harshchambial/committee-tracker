'use client';

import React from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  CheckCircle2, 
  IndianRupee, 
  Building2, 
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';
import { PaymentRecord, CommitteeSettings } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface ReceiptModalProps {
  payment: PaymentRecord | null;
  settings: CommitteeSettings | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  payment,
  settings,
  onClose
}) => {
  const { t, isHindi, getMonthName } = useLanguage();

  // Escape key listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!payment) return null;

  const isPublic = payment.contributionType === 'PUBLIC_SEVA';
  const monthName = getMonthName(payment.month);
  const committeeName = settings?.committeeName || (isHindi ? 'विकास सहयोग समिति' : 'Vikas Sahayog Samiti');
  const rawAdmin = settings?.adminName || payment.verifiedBy || 'Narinder Singh';
  const adminName = (rawAdmin && !rawAdmin.toLowerCase().includes('rajesh sharma') && rawAdmin !== 'Admin')
    ? rawAdmin
    : 'Narinder Singh';
  const receiptNumber = `REC-${payment.year}-${String(payment.month).padStart(2, '0')}-${payment.id.slice(-5).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🧾 *${committeeName} - ${isPublic ? 'Jan Sahayog / Donation Receipt' : 'Monthly Payment Receipt'}*\n\n` +
      `Receipt No: ${receiptNumber}\n` +
      `Contributor: ${payment.memberName}\n` +
      (isPublic && payment.purpose ? `Cause: ${payment.purpose}\n` : `Month: ${monthName} ${payment.year}\n`) +
      `Amount: ₹${payment.amount.toLocaleString('en-IN')}\n` +
      `Status: VERIFIED ✓\n` +
      `UTR / Ref: ${payment.utrNumber || 'Cash/Direct'}\n` +
      `Date: ${new Date(payment.paidAt).toLocaleDateString()}\n` +
      `Authorized: ${adminName} (Committee President)\n\n` +
      `Thank you for your valuable contribution towards public works!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 relative my-auto print:border-none print:shadow-none print:p-2 print:my-0 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Sticky Header with Prominent Close Button */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-slate-100 flex items-center justify-between shrink-0 print:hidden shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {isHindi ? 'डिजिटल रसीद' : 'Official Receipt'}
            </span>
            <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold border border-slate-200">
              {receiptNumber}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 flex items-center justify-center transition cursor-pointer border border-slate-200 active:scale-95 shadow-2xs"
            aria-label={isHindi ? 'रसीद बंद करें' : 'Close Receipt'}
            title={isHindi ? 'बंद करें (Esc)' : 'Close (Esc)'}
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Header */}
          <div className="text-center border-b border-slate-200 pb-4">
            <div className={`w-12 h-12 rounded-2xl ${isPublic ? 'bg-orange-600' : 'bg-emerald-600'} text-white flex items-center justify-center mx-auto mb-2.5 shadow-md`}>
              {isPublic ? <HeartHandshake className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {committeeName}
            </h2>
            <p className="text-xs font-bold text-slate-600 mt-0.5">
              {isPublic ? t('receiptTitlePublic') : t('receiptTitleCore')}
            </p>
            <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('verifiedStamp')}</span>
            </div>
          </div>

          {/* Receipt Info Grid */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
              <span className="text-slate-500 font-medium">{t('receiptNumber')}</span>
              <span className="font-mono font-bold text-slate-900">{receiptNumber}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
              <span className="text-slate-500 font-medium">{t('receivedFrom')}</span>
              <span className="font-bold text-slate-900">{payment.memberName}</span>
            </div>

            {isPublic ? (
              payment.purpose && (
                <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                  <span className="text-slate-500 font-medium">{t('purposeOfContribution')}</span>
                  <span className="font-bold text-orange-800 text-right">{payment.purpose}</span>
                </div>
              )
            ) : (
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                <span className="text-slate-500 font-medium">{isHindi ? 'अंशदान माह:' : 'Contribution For:'}</span>
                <span className="font-bold text-slate-900">{monthName} {payment.year}</span>
              </div>
            )}

            <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
              <span className="text-slate-500 font-medium">{t('paymentMethod')}</span>
              <span className="font-bold text-slate-900">
                {payment.method === 'UPI_QR' ? 'UPI (Google Pay / PhonePe / Paytm)' : (isHindi ? 'नकद भुगतान (Cash)' : 'Cash Payment')}
              </span>
            </div>

            {payment.utrNumber && (
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                <span className="text-slate-500 font-medium">{t('utrRef')}</span>
                <span className="font-mono font-bold text-emerald-700">{payment.utrNumber}</span>
              </div>
            )}

            <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
              <span className="text-slate-500 font-medium">{t('dateOfPayment')}</span>
              <span className="font-medium text-slate-900">
                {new Date(payment.paidAt).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">{t('amountPaid')}</span>
              <span className="text-xs text-slate-600 font-medium">
                {isHindi ? 'भारतीय रुपये' : 'Indian Rupees'}
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 flex items-center">
              <span className="text-lg text-emerald-600 mr-0.5">₹</span>
              {payment.amount.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Authorized Seal & Signature */}
          <div className="pt-3 border-t border-slate-200 flex items-end justify-between">
            <div className="text-left space-y-0.5">
              <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 text-[10px] font-black tracking-tighter">
                SEAL
              </div>
              <span className="text-[9px] text-slate-400 block">Digitally Certified</span>
            </div>

            <div className="text-right">
              <div className="font-serif italic font-bold text-slate-800 text-sm tracking-wide">
                {adminName}
              </div>
              <span className="text-[10px] font-bold text-slate-500 block">
                {t('authorizedSignatory')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons (Print, WhatsApp Share & Done) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 print:hidden space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>{t('printReceipt')}</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{t('shareWhatsApp')}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer text-center"
          >
            {isHindi ? 'रसीद बंद करें (Done)' : 'Close Receipt'}
          </button>
        </div>
      </div>
    </div>
  );
};
