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
  Trash2,
  Camera,
  Image as ImageIcon,
  MapPin,
  Clock,
  Edit3,
  Share2,
  ExternalLink
} from 'lucide-react';
import { ExpenseRecord, ExpenseCategory, TreasurySummary, WorkStatus } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface FundUtilizationProps {
  expenses: ExpenseRecord[];
  summary: TreasurySummary | null;
  isAdminLoggedIn: boolean;
  onAddExpenseClick: () => void;
  onEditExpense?: (expense: ExpenseRecord) => void;
  onDeleteExpense?: (id: string) => void;
  onViewImage?: (images: string[], initialIndex: number, title?: string) => void;
}

const CATEGORY_LABELS: Record<ExpenseCategory, { en: string; hi: string; bg: string; text: string }> = {
  EVENT: { en: 'Event & Meeting', hi: 'बैठक एवं आयोजन', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
  CHARITY: { en: 'Charity & Donation', hi: 'दान एवं सहायता', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  COMMUNITY_WELFARE: { en: 'Community Welfare', hi: 'सार्वजनिक कार्य / विकास', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
  DISBURSEMENT: { en: 'Disbursement / Loan', hi: 'आवंटन / ऋण', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800' },
  ADMINISTRATIVE: { en: 'Admin & Records', hi: 'प्रशासन एवं पंजी', bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700' },
  MAINTENANCE: { en: 'Maintenance', hi: 'मरम्मत एवं रखरखाव', bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700' },
  OTHER: { en: 'General / Other', hi: 'अन्य कार्य', bg: 'bg-gray-100 border-gray-200', text: 'text-gray-700' },
};

const STATUS_CONFIG: Record<WorkStatus, { en: string; hi: string; bg: string; text: string }> = {
  COMPLETED: { en: 'Completed', hi: 'कार्य पूर्ण', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  IN_PROGRESS: { en: 'In Progress', hi: 'प्रगति पर', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800' },
  PLANNED: { en: 'Planned', hi: 'प्रस्तावित', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' }
};

export const FundUtilization: React.FC<FundUtilizationProps> = ({
  expenses,
  summary,
  isAdminLoggedIn,
  onAddExpenseClick,
  onEditExpense,
  onDeleteExpense,
  onViewImage
}) => {
  const { t, isHindi } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (exp.location && exp.location.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;
    if (selectedCategory !== 'ALL' && exp.category !== selectedCategory) return false;
    return true;
  });

  // Group by category to show small distribution
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const handleShareWork = (exp: ExpenseRecord) => {
    const cat = CATEGORY_LABELS[exp.category]?.hi || exp.category;
    const statusText = STATUS_CONFIG[exp.status || 'COMPLETED']?.hi || 'कार्य पूर्ण';
    const text = encodeURIComponent(
      `🏗️ *विकास सहयोग समिति - सार्वजनिक कार्य / विकास कार्य रिपोर्ट*\n\n` +
      `📌 *कार्य:* ${exp.title}\n` +
      `📂 *श्रेणी:* ${cat}\n` +
      `💰 *स्वीकृत खर्च:* ₹${exp.amount.toLocaleString('en-IN')}\n` +
      `📅 *दिनांक:* ${new Date(exp.date).toLocaleDateString('hi-IN')}` +
      (exp.receiptNote ? ` (बिल/वाउचर: ${exp.receiptNote})\n` : '\n') +
      (exp.location ? `📍 *स्थान:* ${exp.location}\n` : '') +
      `✅ *स्थिति:* ${statusText}\n` +
      (exp.description ? `📝 *विवरण:* ${exp.description}\n` : '') +
      (exp.images && exp.images.length > 0 ? `📷 *तस्वीरें:* ${exp.images.length} तस्वीरें ऑनलाइन उपलब्ध हैं\n` : '') +
      `\n🔗 *100% पारदर्शी सच्चा हिसाब एवं तस्वीरें यहाँ देखें:* \nhttps://vikassamiti.vercel.app`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header & Hero Stats */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 mb-2">
            <ReceiptIndianRupee className="w-3.5 h-3.5" />
            <span>{isHindi ? 'पूर्ण पारदर्शिता एवं सचित्र लेखा-जोखा' : 'Full Audit & Visual Accountability'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('expensesTitle')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isHindi 
              ? 'जन सहयोग एवं कोष से किए गए विकास कार्यों का विवरण, तस्वीरें व खर्च' 
              : 'Transparent record and photos of public works funded by community treasury'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              {isHindi ? 'कुल खर्च राशि' : 'Total Spent'}
            </span>
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
              <span>{t('logNewExpense')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {(Object.keys(CATEGORY_LABELS) as ExpenseCategory[]).map(catKey => {
          const config = CATEGORY_LABELS[catKey];
          const isSelected = selectedCategory === catKey;
          const total = categoryTotals[catKey] || 0;

          return (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(isSelected ? 'ALL' : catKey)}
              className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                isSelected 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                  : `${config.bg} hover:border-slate-300`
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${isSelected ? 'text-amber-300' : config.text}`}>
                {isHindi ? config.hi : config.en}
              </span>
              <div className={`text-sm font-black mt-1 flex items-center ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                <IndianRupee className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />
                {total.toLocaleString('en-IN')}
              </div>
            </button>
          );
        })}
      </div>

      {/* Search & List Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isHindi ? 'कार्य, विवरण या स्थान से खोजें...' : 'Search by title, description or location...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {selectedCategory !== 'ALL' && (
            <button
              onClick={() => setSelectedCategory('ALL')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 transition cursor-pointer"
            >
              {isHindi ? 'फ़िल्टर हटाएं' : 'Clear filter'} ({CATEGORY_LABELS[selectedCategory as ExpenseCategory]?.en || selectedCategory})
            </button>
          )}
        </div>

        {/* Expenses List */}
        <div className="divide-y divide-slate-100">
          {filteredExpenses.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ReceiptIndianRupee className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-slate-900">
                {selectedCategory !== 'ALL'
                  ? (isHindi ? `"${CATEGORY_LABELS[selectedCategory as ExpenseCategory]?.hi || selectedCategory}" में कोई खर्च नहीं मिला` : `No expenses under "${CATEGORY_LABELS[selectedCategory as ExpenseCategory]?.en || selectedCategory}"`)
                  : (isHindi ? 'अभी कोई सार्वजनिक कार्य या खर्च दर्ज नहीं है' : 'No Public Works or Expenses Recorded Yet')}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                {selectedCategory !== 'ALL' ? (
                  <>
                    {isHindi ? 'इस श्रेणी में अभी कोई रिकॉर्ड नहीं है।' : 'No records under this filter.'}{' '}
                    <button onClick={() => setSelectedCategory('ALL')} className="text-amber-600 font-bold underline cursor-pointer">
                      {isHindi ? 'सभी श्रेणियां देखें' : 'View all categories'}
                    </button>
                  </>
                ) : (
                  isHindi 
                    ? 'सार्वजनिक कार्य या खर्च दर्ज करने हेतु ऊपर दिए गए "+ नया खर्च दर्ज करें" बटन का उपयोग करें। खर्च दर्ज होते ही आप तस्वीरें भी जोड़ सकेंगे।' 
                    : 'To record a public work, click "+ Log New Expense". You can attach site photos anytime.'
                )}
              </p>
              {selectedCategory === 'ALL' && isAdminLoggedIn && (
                <button
                  type="button"
                  onClick={onAddExpenseClick}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer shadow-xs mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isHindi ? 'पहला सार्वजनिक कार्य दर्ज करें' : 'Log First Public Work'}</span>
                </button>
              )}
            </div>
          ) : (
            filteredExpenses.map(expense => {
              const catConf = CATEGORY_LABELS[expense.category] || CATEGORY_LABELS.OTHER;
              const statusConf = STATUS_CONFIG[expense.status || 'COMPLETED'] || STATUS_CONFIG.COMPLETED;
              const hasImages = expense.images && expense.images.length > 0;

              return (
                <div key={expense.id} className="p-5 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-start justify-between gap-5">
                  <div className="space-y-3 max-w-3xl flex-1">
                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${catConf.bg} ${catConf.text}`}>
                        {isHindi ? catConf.hi : catConf.en}
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusConf.bg} ${statusConf.text} flex items-center gap-1`}>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{isHindi ? statusConf.hi : statusConf.en}</span>
                      </span>

                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(expense.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>

                      {expense.location && (
                        <span className="text-xs font-medium text-slate-600 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          <span>{expense.location}</span>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                      {expense.title}
                    </h3>

                    {/* Description */}
                    {expense.description && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {expense.description}
                      </p>
                    )}

                    {/* Meta info: Bill/Voucher & Recorder */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
                      {expense.receiptNote && (
                        <div className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-0.5 rounded-md font-mono text-slate-700 font-bold border border-slate-200">
                          <FileText className="w-3 h-3 text-slate-400" />
                          <span>{isHindi ? 'बिल/वाउचर:' : 'Bill:'} {expense.receiptNote}</span>
                        </div>
                      )}
                      {expense.recordedBy && (
                        <span>
                          {isHindi ? 'दर्जकर्ता:' : 'Recorded by:'} <strong className="text-slate-700">{expense.recordedBy}</strong>
                        </span>
                      )}
                    </div>

                    {/* 📷 Work Photo Gallery Thumbnails */}
                    {hasImages && (
                      <div className="pt-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                          <Camera className="w-3.5 h-3.5 text-amber-600" />
                          <span>{isHindi ? 'कार्य की तस्वीरें (Work Photos):' : 'Work Photos:'}</span>
                          <span className="text-slate-400 font-normal">({expense.images!.length})</span>
                        </div>

                        <div className="flex flex-wrap gap-2.5">
                          {expense.images!.map((imgUrl, imgIdx) => (
                            <button
                              key={imgIdx}
                              type="button"
                              onClick={() => onViewImage?.(expense.images!, imgIdx, expense.title)}
                              className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-slate-200 hover:border-amber-500 shadow-2xs transition cursor-pointer shrink-0 active:scale-95 bg-slate-100"
                              title={isHindi ? 'बड़ी तस्वीर देखने हेतु क्लिक करें' : 'Click to view full photo'}
                            >
                              <img src={imgUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-200" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                                <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 drop-shadow-md transition" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prompt to add photos if admin and none attached */}
                    {!hasImages && isAdminLoggedIn && onEditExpense && (
                      <button
                        type="button"
                        onClick={() => onEditExpense(expense)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 transition cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{isHindi ? '+ कार्य की तस्वीरें जोड़ें (Add Photos)' : '+ Add Work Photos'}</span>
                      </button>
                    )}
                  </div>

                  {/* Right side: Amount & Action buttons */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-2xl font-black text-amber-600 flex items-center">
                      <IndianRupee className="w-5 h-5 stroke-[2.5]" />
                      {expense.amount.toLocaleString('en-IN')}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* WhatsApp Share Button */}
                      <button
                        type="button"
                        onClick={() => handleShareWork(expense)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold text-xs transition cursor-pointer shadow-2xs active:scale-95"
                        title={isHindi ? 'गाँव/समिति व्हाट्सएप ग्रुप पर रिपोर्ट भेजें' : 'Share Work Report on WhatsApp'}
                      >
                        <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isHindi ? 'शेयर' : 'Share'}</span>
                      </button>

                      {/* Edit Button (Admins only) */}
                      {isAdminLoggedIn && onEditExpense && (
                        <button
                          type="button"
                          onClick={() => onEditExpense(expense)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 font-bold text-xs transition cursor-pointer shadow-2xs active:scale-95"
                          title={isHindi ? 'विवरण या फोटो बदलें' : 'Edit work details or photos'}
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                          <span>{isHindi ? 'बदलें' : 'Edit'}</span>
                        </button>
                      )}

                      {/* Delete Button (Admins only) */}
                      {isAdminLoggedIn && onDeleteExpense && (
                        <button
                          type="button"
                          onClick={() => onDeleteExpense(expense.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold text-xs transition cursor-pointer shadow-2xs active:scale-95"
                          title={isHindi ? 'इस कार्य रिकॉर्ड को हटाएं' : 'Delete this public work record'}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>{isHindi ? 'हटाएं' : 'Delete'}</span>
                        </button>
                      )}
                    </div>
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
