'use client';

import React from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  CheckCircle2, 
  IndianRupee, 
  Building2, 
  ShieldCheck 
} from 'lucide-react';
import { PaymentRecord, CommitteeSettings } from '@/types';

interface ReceiptModalProps {
  payment: PaymentRecord | null;
  settings: CommitteeSettings | null;
  onClose: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  payment,
  settings,
  onClose
}) => {
  if (!payment) return null;

  const monthName = MONTHS[payment.month - 1];
  const committeeName = settings?.committeeName || 'Committee Treasury';
  const receiptNumber = `REC-${payment.year}-${String(payment.month).padStart(2, '0')}-${payment.id.slice(-5).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🧾 *${committeeName} - Payment Receipt*\n\n` +
      `Receipt No: ${receiptNumber}\n` +
      `Member: ${payment.memberName}\n` +
      `Month: ${monthName} ${payment.year}\n` +
      `Amount Paid: ₹${payment.amount.toLocaleString('en-IN')}\n` +
      `Status: VERIFIED ✓\n` +
      `UTR / Ref: ${payment.utrNumber || 'Cash/Direct'}\n` +
      `Date: ${new Date(payment.paidAt).toLocaleDateString()}\n\n` +
      `Thank you for your valuable contribution!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 print:border-none print:shadow-none print:p-2 print:my-0">
        {/* Close Button (Hidden in Print) */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer print:hidden"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Receipt Content */}
        <div id="printable-receipt" className="space-y-6">
          {/* Header */}
          <div className="text-center border-b border-slate-200 pb-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {committeeName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Official Contribution Payment Receipt
            </p>
            <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified & Credited to Treasury
            </div>
          </div>

          {/* Receipt Info Grid */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
              <span className="text-slate-500 font-medium">Receipt No:</span>
              <span className="font-mono font-bold text-slate-900">{receiptNumber}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
              <span className="text-slate-500 font-medium">Member Name:</span>
              <span className="font-bold text-slate-900">{payment.memberName}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
              <span className="text-slate-500 font-medium">Contribution For:</span>
              <span className="font-bold text-slate-900">{monthName} {payment.year}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
              <span className="text-slate-500 font-medium">Payment Mode:</span>
              <span className="font-bold text-slate-900">{payment.method === 'UPI_QR' ? 'UPI (Google Pay/PhonePe/Paytm)' : payment.method}</span>
            </div>

            {payment.utrNumber && (
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                <span className="text-slate-500 font-medium">UPI Ref / UTR No:</span>
                <span className="font-mono font-bold text-emerald-700">{payment.utrNumber}</span>
              </div>
            )}

            <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
              <span className="text-slate-500 font-medium">Payment Date:</span>
              <span className="font-medium text-slate-900">
                {new Date(payment.paidAt).toLocaleDateString('en-IN', {
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
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Amount Received</span>
              <span className="text-xs text-slate-600 italic">Rupees One Thousand Only</span>
            </div>
            <div className="text-2xl font-black text-emerald-600 flex items-center">
              <IndianRupee className="w-5 h-5 stroke-[2.5]" />
              {payment.amount.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Seal / Signatory */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-[11px] text-slate-500">
            <div>
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-emerald-500/50 flex items-center justify-center text-[8px] font-bold text-emerald-700 uppercase leading-none text-center transform -rotate-12">
                VERIFIED<br/>SEAL
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-800">Authorized Signatory</div>
              <div className="text-[10px] text-slate-400">{settings?.payeeName || 'Committee Admin'}</div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons (Hidden in Print) */}
        <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-100 print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / PDF
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            Share WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
