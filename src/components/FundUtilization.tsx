'use client';

import React, { useState } from 'react';
import { 
  ReceiptIndianRupee, 
  IndianRupee, 
  Plus, 
  Search, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  FileText,
  Filter,
  Trash2
} from 'lucide-react';
import { ExpenseRecord, ExpenseCategory, TreasurySummary } from '@/types';

interface FundUtilizationProps {
  expenses: ExpenseRecord[];
  summary: TreasurySummary | null;
  isAdminLoggedIn: boolean;
  onAddExpenseClick: () => void;
  onDeleteExpense?: (id: string) => void;
}

const CATEGORY_COLORS: Record<ExpenseCategory, { bg: string; text: string; label: string }> = {
  EVENT: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', label: 'Event & Meeting' },
  CHARITY: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Charity & Donation' },
  COMMUNITY_WELFARE: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Community Welfare' },
  DISBURSEMENT: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', label: 'Disbursement / Loan' },
  ADMINISTRATIVE: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', label: 'Admin & Records' },
  MAINTENANCE: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', label: 'Maintenance' },
  OTHER: { bg: 'bg-gray-100 border-gray-200', text: 'text-gray-700', label: 'General / Other' },
};

export const FundUtilization: React.FC<FundUtilizationProps> = ({
  expenses,
  summary,
  isAdminLoggedIn,
  onAddExpenseClick,
  onDeleteExpense
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exp.description.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedCategory !== 'ALL' && exp.category !== selectedCategory) return false;
    return true;
  });

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category to show small distribution
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  return (
    <div className="space-y-6">
      {/* Header & Hero Stats */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 mb-2">
            <ReceiptIndianRupee className="w-3.5 h-3.5" />
            Full Audit & Accountability
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Fund Utilization & Expense Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete transparency into where committee money has been utilized.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Disbursed / Spent</span>
            <div className="text-xl font-black text-amber-600 flex items-center justify-end">
              <IndianRupee className="w-4 h-4 mr-0.5 stroke-[2.5]" />
              {(summary?.totalExpenses ?? 0).toLocaleString('en-IN')}
            </div>
          </div>

          {isAdminLoggedIn && (
            <button
              onClick={onAddExpenseClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Log New Expense
            </button>
          )}
        </div>
      </div>

      {/* Category Pills & Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {Object.entries(CATEGORY_COLORS).map(([catKey, conf]) => {
          const total = categoryTotals[catKey] || 0;
          return (
            <div 
              key={catKey}
              onClick={() => setSelectedCategory(selectedCategory === catKey ? 'ALL' : catKey)}
              className={`p-3 rounded-xl border transition cursor-pointer ${
                selectedCategory === catKey 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                  : `${conf.bg} hover:border-slate-400`
              }`}
            >
              <span className={`text-[10px] uppercase font-extrabold block truncate ${
                selectedCategory === catKey ? 'text-slate-300' : conf.text
              }`}>
                {conf.label}
              </span>
              <div className={`text-base font-black mt-1 ${
                selectedCategory === catKey ? 'text-white' : 'text-slate-900'
              }`}>
                ₹{total.toLocaleString('en-IN')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        {selectedCategory !== 'ALL' && (
          <button
            onClick={() => setSelectedCategory('ALL')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
          >
            Clear category filter ({CATEGORY_COLORS[selectedCategory as ExpenseCategory]?.label})
          </button>
        )}
      </div>

      {/* Expense Records List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-bold">
          <span>Showing {filteredExpenses.length} expense records</span>
          <span className="text-amber-700">Total: ₹{totalFiltered.toLocaleString('en-IN')}</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredExpenses.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No expenses recorded under this category yet.
            </div>
          ) : (
            filteredExpenses.map(expense => {
              const catConf = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.OTHER;
              return (
                <div key={expense.id} className="p-5 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${catConf.bg} ${catConf.text}`}>
                        {catConf.label}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(expense.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {expense.title}
                    </h3>

                    {expense.description && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {expense.description}
                      </p>
                    )}

                    {expense.receiptNote && (
                      <div className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                        <FileText className="w-3 h-3 text-slate-400" />
                        {expense.receiptNote}
                      </div>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                    <div className="text-xl font-black text-slate-900 flex items-center text-amber-600">
                      <IndianRupee className="w-4 h-4 stroke-[2.5]" />
                      {expense.amount.toLocaleString('en-IN')}
                    </div>

                    {isAdminLoggedIn && onDeleteExpense && (
                      <button
                        onClick={() => onDeleteExpense(expense.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete expense entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
