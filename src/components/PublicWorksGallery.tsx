'use client';

import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Camera,
  CheckCircle2,
  Clock3,
  FileText,
  IndianRupee,
  MapPin,
  Search,
  Share2,
  ShieldCheck,
  Play,
  ListChecks,
  ChevronDown
} from 'lucide-react';
import { ExpenseBreakdown, ExpenseCategory, WorkStatus } from '@/types';
import { ImageViewerModal } from '@/components/ImageViewerModal';
import { useLanguage } from '@/context/LanguageContext';
import { isVideoMedia } from '@/lib/workMedia';

export interface PublicWork {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  receiptNote?: string;
  images: string[];
  status: WorkStatus;
  location?: string;
  breakdown?: ExpenseBreakdown;
}

interface PublicWorksGalleryProps {
  works: PublicWork[];
}

const CATEGORY_LABELS: Record<ExpenseCategory, { en: string; hi: string }> = {
  EVENT: { en: 'Event & Meeting', hi: 'बैठक एवं आयोजन' },
  CHARITY: { en: 'Charity & Donation', hi: 'दान एवं सहायता' },
  COMMUNITY_WELFARE: { en: 'Community Welfare', hi: 'सार्वजनिक कार्य / विकास' },
  DISBURSEMENT: { en: 'Disbursement / Loan', hi: 'आवंटन / ऋण' },
  ADMINISTRATIVE: { en: 'Admin & Records', hi: 'प्रशासन एवं रिकॉर्ड' },
  MAINTENANCE: { en: 'Maintenance', hi: 'मरम्मत एवं रखरखाव' },
  OTHER: { en: 'General / Other', hi: 'सामान्य / अन्य' }
};

const STATUS_LABELS: Record<WorkStatus, { en: string; hi: string }> = {
  COMPLETED: { en: 'Completed', hi: 'कार्य पूर्ण' },
  IN_PROGRESS: { en: 'In Progress', hi: 'कार्य प्रगति पर' },
  PLANNED: { en: 'Planned', hi: 'प्रस्तावित' }
};

export const PublicWorksGallery: React.FC<PublicWorksGalleryProps> = ({ works }) => {
  const { isHindi } = useLanguage();
  const [search, setSearch] = useState('');
  const [viewer, setViewer] = useState<{ work: PublicWork; index: number } | null>(null);

  const filteredWorks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return works;
    return works.filter(work =>
      [work.title, work.description, work.location, CATEGORY_LABELS[work.category].en, CATEGORY_LABELS[work.category].hi]
        .filter(Boolean)
        .some(value => value!.toLowerCase().includes(query))
    );
  }, [search, works]);

  const shareWork = (work: PublicWork) => {
    const videoCount = work.images.filter(isVideoMedia).length;
    const photoCount = work.images.length - videoCount;
    const publicUrl = `${window.location.origin}/public-works#${encodeURIComponent(work.id)}`;
    const message = encodeURIComponent(
      (isHindi
        ? `🏗️ *विकास सहयोग समिति – किए गए कार्य*\n\n` +
          `📌 *कार्य:* ${work.title}\n` +
          `💰 *खर्च:* ₹${work.amount.toLocaleString('en-IN')}\n` +
          `📅 *दिनांक:* ${new Date(work.date).toLocaleDateString('hi-IN')}\n` +
          (work.location ? `📍 *स्थान:* ${work.location}\n` : '') +
          `✅ *स्थिति:* ${STATUS_LABELS[work.status].hi}\n` +
          (work.description ? `📝 *विवरण:* ${work.description}\n` : '') +
          (photoCount ? `📷 *तस्वीरें:* ${photoCount}\n` : '') +
          (videoCount ? `🎥 *वीडियो:* ${videoCount}\n` : '') +
          `\nपारदर्शी सार्वजनिक रिपोर्ट देखें: ${publicUrl}`
        : `🏗️ *Vikas Sahayog Samiti – Work Done*\n\n` +
          `📌 *Work:* ${work.title}\n` +
          `💰 *Amount:* ₹${work.amount.toLocaleString('en-IN')}\n` +
          `📅 *Date:* ${new Date(work.date).toLocaleDateString('en-IN')}\n` +
          (work.location ? `📍 *Location:* ${work.location}\n` : '') +
          `✅ *Status:* ${STATUS_LABELS[work.status].en}\n` +
          (work.description ? `📝 *Details:* ${work.description}\n` : '') +
          (photoCount ? `📷 *Photos:* ${photoCount}\n` : '') +
          (videoCount ? `🎥 *Videos:* ${videoCount}\n` : '') +
          `\nSee the transparent public report: ${publicUrl}`)
    );
    window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <span>{isHindi ? 'सार्वजनिक, केवल देखने योग्य पारदर्शिता रिपोर्ट' : 'Public, view-only transparency report'}</span>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder={isHindi ? 'कार्य, स्थान या श्रेणी खोजें...' : 'Search work, location or category...'}
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
          />
        </div>
      </div>

      {filteredWorks.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <Camera className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <h2 className="text-lg font-black text-slate-900">{isHindi ? 'कोई सार्वजनिक कार्य नहीं मिला' : 'No public work found'}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {isHindi ? 'प्रकाशित कार्य, फोटो और वीडियो यहाँ दिखाई देंगे।' : 'Published work, photos and videos will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredWorks.map(work => {
            const lineItemCount = work.breakdown?.phases.reduce((count, phase) => count + phase.items.length, 0) || 0;
            const statusStyles = work.status === 'COMPLETED'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : work.status === 'IN_PROGRESS'
                ? 'border-amber-200 bg-amber-50 text-amber-800'
                : 'border-blue-200 bg-blue-50 text-blue-700';

            return (
              <article
                key={work.id}
                id={work.id}
                className="scroll-mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                {work.images.length > 0 && (
                  <div className={`grid h-64 gap-1 bg-slate-100 sm:h-80 ${work.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {work.images.slice(0, 3).map((image, index) => {
                      const isVideo = isVideoMedia(image);
                      return (
                      <button
                        key={`${work.id}-${index}`}
                        type="button"
                        onClick={() => setViewer({ work, index })}
                        className={`group relative overflow-hidden bg-slate-200 ${work.images.length === 3 && index === 0 ? 'row-span-2' : ''}`}
                        aria-label={isHindi ? `${work.title} का ${isVideo ? 'वीडियो' : 'फोटो'} ${index + 1} देखें` : `View ${work.title} ${isVideo ? 'video' : 'photo'} ${index + 1}`}
                      >
                        {isVideo ? (
                          <>
                            <video src={image} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" muted playsInline preload="metadata" />
                            <Play className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white shadow-lg" />
                          </>
                        ) : (
                          <img
                            src={image}
                            alt={`${work.title} – work photo ${index + 1}`}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        )}
                        {index === 2 && work.images.length > 3 && (
                          <span className="absolute inset-0 flex items-center justify-center bg-slate-950/60 text-xl font-black text-white">
                            +{work.images.length - 3} {isHindi ? 'मीडिया' : 'more'}
                          </span>
                        )}
                      </button>
                    );})}
                  </div>
                )}

                <div className="p-5 sm:p-7">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-extrabold ${statusStyles}`}>
                          {work.status === 'COMPLETED' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                          {isHindi ? STATUS_LABELS[work.status].hi : STATUS_LABELS[work.status].en}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
                          {isHindi ? CATEGORY_LABELS[work.category].hi : CATEGORY_LABELS[work.category].en}
                        </span>
                      </div>

                      <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{work.title}</h2>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          {new Date(work.date).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        {work.location && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-rose-500" />
                            {work.location}
                          </span>
                        )}
                        {work.receiptNote && (
                          <span className="inline-flex items-center gap-1.5">
                            <FileText className="h-4 w-4" />
                            {isHindi ? 'बिल/वाउचर' : 'Bill/Voucher'}: {work.receiptNote}
                          </span>
                        )}
                      </div>

                      {work.description && <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{work.description}</p>}
                    </div>

                    <div className="flex shrink-0 flex-row items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 md:min-w-48 md:flex-col md:items-end">
                      <div>
                        <span className="block text-[10px] font-black uppercase tracking-wider text-amber-700">
                          {isHindi ? 'कुल खर्च' : 'Amount spent'}
                        </span>
                        <span className="mt-1 flex items-center text-2xl font-black text-slate-950">
                          <IndianRupee className="h-5 w-5" />
                          {work.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => shareWork(work)}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-500"
                      >
                        <Share2 className="h-4 w-4" />
                        {isHindi ? 'साझा करें' : 'Share'}
                      </button>
                    </div>
                  </div>

                  {work.breakdown && (
                    <details className="group mt-6 overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/60" open>
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 sm:p-5">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                            <ListChecks className="h-5 w-5" />
                          </span>
                          <div>
                            <h3 className="font-black text-slate-950">
                              {isHindi ? 'पैसा कहाँ और कब खर्च हुआ' : 'When and where the money was spent'}
                            </h3>
                            <p className="text-xs font-semibold text-slate-600">
                              {isHindi
                                ? `${work.breakdown.phases.length} कार्य चरण • ${lineItemCount} खर्च प्रविष्टियाँ`
                                : `${work.breakdown.phases.length} work stages • ${lineItemCount} expense entries`}
                            </p>
                          </div>
                        </div>
                        <ChevronDown className="h-5 w-5 shrink-0 text-emerald-700 transition group-open:rotate-180" />
                      </summary>

                      <div className="border-t border-emerald-200 bg-white p-4 sm:p-5">
                        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div className="rounded-xl bg-slate-50 p-3">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{isHindi ? 'विवरण अवधि' : 'Statement period'}</span>
                            <strong className="mt-1 block text-sm text-slate-900">
                              {new Date(work.breakdown.phases[0].date).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' })}
                              {' – '}
                              {new Date(work.breakdown.verifiedThrough).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </strong>
                          </div>
                          <div className="rounded-xl bg-slate-50 p-3">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{isHindi ? 'स्थान' : 'Location'}</span>
                            <strong className="mt-1 block text-sm text-slate-900">{work.location || 'Shamshan Ghat'}</strong>
                          </div>
                          <div className="rounded-xl bg-amber-50 p-3">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">{isHindi ? 'दस्तावेज़ अनुसार कुल' : 'Documented total'}</span>
                            <strong className="mt-1 block text-lg text-slate-950">₹{work.breakdown.total.toLocaleString('en-IN')}</strong>
                          </div>
                        </div>

                        {work.breakdown.unreconciledAmount && work.breakdown.reconciliationNote && (
                          <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-950">
                            <strong className="block font-black">
                              {isHindi ? `₹${work.breakdown.unreconciledAmount.toLocaleString('en-IN')} का मिलान बाकी` : `₹${work.breakdown.unreconciledAmount.toLocaleString('en-IN')} reconciliation difference`}
                            </strong>
                            <span>{isHindi && work.breakdown.reconciliationNoteHi ? work.breakdown.reconciliationNoteHi : work.breakdown.reconciliationNote}</span>
                            {work.breakdown.calculatedItemsTotal && (
                              <span className="mt-1 block font-bold">
                                {isHindi
                                  ? `सभी दर्ज मदों का योग: ₹${work.breakdown.calculatedItemsTotal.toLocaleString('en-IN')} • विवरण का छपा कुल: ₹${work.breakdown.total.toLocaleString('en-IN')}`
                                  : `All listed items total: ₹${work.breakdown.calculatedItemsTotal.toLocaleString('en-IN')} • Statement grand total: ₹${work.breakdown.total.toLocaleString('en-IN')}`}
                              </span>
                            )}
                          </div>
                        )}

                        {work.breakdown.previousRecordedTotal && work.breakdown.previousRecordedTotal !== work.breakdown.total && (
                          <p className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold leading-5 text-blue-900">
                            {isHindi
                              ? `पहले प्रकाशित ₹${work.breakdown.previousRecordedTotal.toLocaleString('en-IN')} का आंकड़ा 12 सितंबर तक था। इस विवरण में ${new Date(work.breakdown.verifiedThrough).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })} तक के बाद के कार्य भी शामिल हैं।`
                              : `The earlier published ₹${work.breakdown.previousRecordedTotal.toLocaleString('en-IN')} figure covered work through 12 September. This statement adds subsequent work through ${new Date(work.breakdown.verifiedThrough).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.`}
                          </p>
                        )}

                        <div className="space-y-3">
                          {work.breakdown.phases.map((phase, phaseIndex) => (
                            <details key={`${phase.date}-${phaseIndex}`} className="group/phase overflow-hidden rounded-xl border border-slate-200 bg-white" open={phaseIndex === 0}>
                              <summary className="grid cursor-pointer list-none grid-cols-[1fr_auto] items-center gap-3 p-3 sm:grid-cols-[8rem_1fr_auto] sm:p-4">
                                <span className="text-xs font-black text-emerald-700">
                                  {new Date(phase.date).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                                <span className="col-start-1 row-start-2 text-sm font-bold text-slate-800 sm:col-start-2 sm:row-start-1">
                                  {isHindi && phase.titleHi ? phase.titleHi : phase.title}
                                  <span className="ml-2 text-[11px] font-semibold text-slate-400">({phase.items.length})</span>
                                </span>
                                <span className="row-span-2 flex items-center gap-2 text-sm font-black text-slate-950 sm:row-span-1">
                                  ₹{phase.subtotal.toLocaleString('en-IN')}
                                  <ChevronDown className="h-4 w-4 text-slate-400 transition group-open/phase:rotate-180" />
                                </span>
                              </summary>
                              <div className="border-t border-slate-200 bg-slate-50/60 px-3 py-2 sm:px-4">
                                <div className="mb-2 text-[11px] font-bold text-slate-500">
                                  📍 {phase.location || work.location || 'Shamshan Ghat'}
                                </div>
                                <div className="divide-y divide-slate-200">
                                  {phase.items.map((item, itemIndex) => (
                                    <div key={`${item.description}-${itemIndex}`} className="flex items-start justify-between gap-4 py-2.5 text-sm">
                                      <span className="text-slate-700">
                                        {isHindi && item.descriptionHi ? item.descriptionHi : item.description}
                                        {item.includedInTotal === false && (
                                          <span className="ml-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                            {isHindi ? 'छपे कुल में शामिल नहीं' : 'Not included in printed total'}
                                          </span>
                                        )}
                                      </span>
                                      <strong className={item.includedInTotal === false ? 'shrink-0 text-amber-800' : 'shrink-0 text-slate-950'}>₹{item.amount.toLocaleString('en-IN')}</strong>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </details>
                          ))}
                        </div>

                        <p className="mt-4 text-[11px] leading-5 text-slate-500">
                          {isHindi ? 'स्रोत: समिति द्वारा उपलब्ध कराया गया विस्तृत व्यय विवरण।' : `Source: ${work.breakdown.sourceTitle}${work.breakdown.sourceDocument ? ` (${work.breakdown.sourceDocument})` : ''}.`}
                        </p>
                      </div>
                    </details>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ImageViewerModal
        isOpen={Boolean(viewer)}
        onClose={() => setViewer(null)}
        images={viewer?.work.images || []}
        initialIndex={viewer?.index || 0}
        title={viewer?.work.title}
      />
    </>
  );
};
