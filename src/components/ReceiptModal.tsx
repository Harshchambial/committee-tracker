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

  if (!payment) return null;

  const isPublic = payment.contributionType === 'PUBLIC_SEVA';
  const monthName = getMonthName(payment.month);
  const committeeName = settings?.committeeName || (isHindi ? 'विकास सहयोग समिति' : 'Vikas Sahayog Samiti');
  const adminName = settings?.adminName || 'Narinder Singh';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-7 shadow-2xl border border-slate-200 relative my-6 print:border-none print:shadow-none print:p-2 print:my-0">
        {/* Close Button (Hidden in Print) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer print:hidden"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Receipt Content */}
        <div id="printable-receipt" className="space-y-5">
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

        {/* Action Buttons (Print & WhatsApp Share) */}
        <div className="grid grid-cols-2 gap-2 mt-5 pt-3 border-t border-slate-100 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>{t('printReceipt')}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{t('shareWhatsApp')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
