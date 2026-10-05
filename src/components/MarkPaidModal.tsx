'use client';

import React, { useState } from 'react';
import { CheckCircle2, IndianRupee, Loader2, X } from 'lucide-react';
import { Member, PaymentMethod, PaymentRecord } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface MarkPaidModalProps {
  isOpen: boolean;
  member: Member | null;
  month: number;
  year: number;
  defaultAmount: number;
  adminPin: string;
  verifiedBy: string;
  onClose: () => void;
  onRecorded: (payment: PaymentRecord) => void;
}

export const MarkPaidModal: React.FC<MarkPaidModalProps> = ({
  isOpen,
  member,
  month,
  year,
  defaultAmount,
  adminPin,
  verifiedBy,
  onClose,
  onRecorded
}) => {
  const { isHindi, getMonthName } = useLanguage();
  const [amount, setAmount] = useState(defaultAmount);
  const [method, setMethod] = useState<Extract<PaymentMethod, 'CASH' | 'BANK_TRANSFER'>>('CASH');
  const [notes, setNotes] = useState('');
  const [pin, setPin] = useState(adminPin);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !member) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pin.trim()) {
      setError(isHindi ? 'व्यवस्थापक पिन दर्ज करें।' : 'Enter the Admin PIN to confirm this payment.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      const response = await fetch('/api/payments/offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          month,
          year,
          amount: Number(amount),
          method,
          notes: notes.trim() || undefined,
          contributionType: 'CORE_MONTHLY',
          adminPin: pin.trim(),
          verifiedBy
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to record payment');
      onRecorded(data.payment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 bg-emerald-50/70 p-5">
          <div>
            <div className="mb-1 flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-wider">
                {isHindi ? 'व्यवस्थापक प्रविष्टि' : 'Admin payment entry'}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900">
              {isHindi ? 'भुगतान जमा करें' : 'Mark as Paid'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-slate-900 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="font-extrabold text-slate-900">{member.name}</div>
            <div className="mt-1 text-sm font-semibold text-slate-600">
              {getMonthName(month)} {year}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5 text-xs font-bold text-slate-700">
              <span>{isHindi ? 'राशि' : 'Amount'}</span>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={amount}
                  onChange={(event) => setAmount(Number(event.target.value))}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm font-bold outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                />
              </div>
            </label>

            <label className="space-y-1.5 text-xs font-bold text-slate-700">
              <span>{isHindi ? 'भुगतान तरीका' : 'Payment method'}</span>
              <select
                value={method}
                onChange={(event) => setMethod(event.target.value as 'CASH' | 'BANK_TRANSFER')}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
              >
                <option value="CASH">{isHindi ? 'नकद' : 'Cash'}</option>
                <option value="BANK_TRANSFER">{isHindi ? 'बैंक / UPI ट्रांसफर' : 'Bank / UPI transfer'}</option>
              </select>
            </label>
          </div>

          <label className="block space-y-1.5 text-xs font-bold text-slate-700">
            <span>{isHindi ? 'नोट (वैकल्पिक)' : 'Notes (optional)'}</span>
            <input
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={isHindi ? 'जैसे: व्यक्तिगत रूप से नकद प्राप्त' : 'Example: Cash received in person'}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
            />
          </label>

          {!adminPin && (
            <label className="block space-y-1.5 text-xs font-bold text-slate-700">
              <span>{isHindi ? 'व्यवस्थापक पिन' : 'Admin PIN'}</span>
              <input
                type="password"
                inputMode="numeric"
                required
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
              />
            </label>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSaving || amount <= 0}
              className="flex flex-[1.4] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {isSaving
                ? (isHindi ? 'जमा हो रहा है...' : 'Recording...')
                : (isHindi ? 'भुगतान जमा करें' : 'Confirm Paid')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
