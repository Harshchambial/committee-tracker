'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  ReceiptIndianRupee, 
  IndianRupee, 
  Calendar, 
  Tag, 
  FileText, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { ExpenseCategory, CommitteeSettings } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminPin: string;
  settings: CommitteeSettings | null;
  onExpenseAdded: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  adminPin,
  settings,
  onExpenseAdded
}) => {
  const { isHindi } = useLanguage();
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('COMMUNITY_WELFARE');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptNote, setExpenseReceiptNote] = useState('');
  const [description, setDescription] = useState('');
  const [pinInput, setPinInput] = useState(adminPin || '');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (adminPin) {
      setPinInput(adminPin);
    }
  }, [adminPin]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanTitle = title.trim();
    const cleanAmount = parseFloat(amount);
    const pinToUse = (pinInput || adminPin).trim();

    if (!cleanTitle) {
      setErrorMessage(isHindi ? 'कृपया व्यय / कार्य का शीर्षक दर्ज करें।' : 'Please enter the expense / work title.');
      return;
    }

    if (!cleanAmount || cleanAmount <= 0) {
      setErrorMessage(isHindi ? 'कृपया मान्य व्यय राशि दर्ज करें।' : 'Please enter a valid expense amount.');
      return;
    }

    if (!pinToUse) {
      setErrorMessage(isHindi ? 'व्यवस्थापक पिन (Admin PIN) आवश्यक है।' : 'Admin PIN is required to log expenses.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: cleanTitle,
          category,
          amount: cleanAmount,
          date,
          description: description.trim(),
          receiptNote: receiptNote.trim(),
          adminPin: pinToUse,
          recordedBy: settings?.adminName || 'Admin'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record expense');

      confetti({ particleCount: 50, spread: 60 });
      onExpenseAdded();

      // Reset
      setTitle('');
      setAmount('');
      setDescription('');
      setExpenseReceiptNote('');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0 shadow-xs">
            <ReceiptIndianRupee className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {isHindi ? 'नया सार्वजनिक कार्य / व्यय दर्ज करें' : 'Log New Public Work / Expense'}
            </h3>
            <p className="text-xs text-slate-500">
              {isHindi ? 'यह राशि सार्वजनिक कोष से व्यय के रूप में दर्ज होगी' : 'This amount will be deducted from the available treasury fund'}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {isHindi ? 'कार्य / व्यय शीर्षक *' : 'Work / Expense Title *'}
            </label>
            <input
              ref={titleInputRef}
              type="text"
              placeholder={isHindi ? 'उदा. गली की स्ट्रीट लाइट मरम्मत, पाइपलाइन कार्य...' : 'e.g. Street Light Repair, Water Pipeline...'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {isHindi ? 'श्रेणी *' : 'Category *'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 font-medium"
              >
                <option value="COMMUNITY_WELFARE">{isHindi ? 'सार्वजनिक कार्य / विकास' : 'Community Welfare'}</option>
                <option value="EVENT">{isHindi ? 'बैठक एवं आयोजन' : 'Event & Meeting'}</option>
                <option value="CHARITY">{isHindi ? 'दान एवं सहायता' : 'Charity & Donation'}</option>
                <option value="DISBURSEMENT">{isHindi ? 'आवंटन / ऋण' : 'Member Loan / Disbursement'}</option>
                <option value="ADMINISTRATIVE">{isHindi ? 'प्रशासन एवं पंजी' : 'Admin & Stationery'}</option>
                <option value="MAINTENANCE">{isHindi ? 'मरम्मत एवं रखरखाव' : 'Maintenance'}</option>
                <option value="OTHER">{isHindi ? 'अन्य कार्य' : 'Other'}</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {isHindi ? 'खर्च राशि (₹) *' : 'Amount (₹) *'}
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
                <input
                  type="number"
                  placeholder="1500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm font-black focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {isHindi ? 'दिनांक *' : 'Date *'}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            {/* Bill Voucher */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {isHindi ? 'बिल / वाउचर' : 'Receipt Voucher'}
              </label>
              <input
                type="text"
                placeholder={isHindi ? 'उदा. बिल क्र. 441' : 'e.g. Bill #441'}
                value={receiptNote}
                onChange={(e) => setExpenseReceiptNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {isHindi ? 'विवरण (वैकल्पिक)' : 'Description (Optional)'}
            </label>
            <textarea
              rows={2}
              placeholder={isHindi ? 'सार्वजनिक कार्य या खर्च का विवरण...' : 'Expenditure details for transparency records...'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          {/* Admin PIN (if not already authenticated) */}
          {!adminPin && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {isHindi ? 'व्यवस्थापक पिन (Admin PIN) *' : 'Admin PIN *'}
              </label>
              <input
                type="password"
                placeholder="****"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs tracking-widest focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 font-bold"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md shadow-slate-900/10 transition cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isLoading ? (isHindi ? 'दर्ज किया जा रहा है...' : 'Recording...') : (isHindi ? 'सार्वजनिक कार्य दर्ज करें' : 'Record Public Work')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
