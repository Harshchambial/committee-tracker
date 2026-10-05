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
  ShieldCheck
} from 'lucide-react';
import { ExpenseCategory, WorkStatus } from '@/types';
import { ImageViewerModal } from '@/components/ImageViewerModal';

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
}

interface PublicWorksGalleryProps {
  works: PublicWork[];
}

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  EVENT: 'Event & Meeting',
  CHARITY: 'Charity & Donation',
  COMMUNITY_WELFARE: 'Community Welfare',
  DISBURSEMENT: 'Disbursement / Loan',
  ADMINISTRATIVE: 'Admin & Records',
  MAINTENANCE: 'Maintenance',
  OTHER: 'General / Other'
};

const STATUS_LABELS: Record<WorkStatus, string> = {
  COMPLETED: 'Completed',
  IN_PROGRESS: 'In Progress',
  PLANNED: 'Planned'
};

export const PublicWorksGallery: React.FC<PublicWorksGalleryProps> = ({ works }) => {
  const [search, setSearch] = useState('');
  const [viewer, setViewer] = useState<{ work: PublicWork; index: number } | null>(null);

  const filteredWorks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return works;
    return works.filter(work =>
      [work.title, work.description, work.location, CATEGORY_LABELS[work.category]]
        .filter(Boolean)
        .some(value => value!.toLowerCase().includes(query))
    );
  }, [search, works]);

  const shareWork = (work: PublicWork) => {
    const publicUrl = `${window.location.origin}/public-works#${encodeURIComponent(work.id)}`;
    const message = encodeURIComponent(
      `🏗️ *Vikas Sahayog Samiti – Work Done*\n\n` +
      `📌 *Work:* ${work.title}\n` +
      `💰 *Amount:* ₹${work.amount.toLocaleString('en-IN')}\n` +
      `📅 *Date:* ${new Date(work.date).toLocaleDateString('en-IN')}\n` +
      (work.location ? `📍 *Location:* ${work.location}\n` : '') +
      `✅ *Status:* ${STATUS_LABELS[work.status]}\n` +
      (work.description ? `📝 *Details:* ${work.description}\n` : '') +
      (work.images.length ? `📷 *Photos:* ${work.images.length} work photo${work.images.length === 1 ? '' : 's'}\n` : '') +
      `\nSee the transparent public report: ${publicUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <span>Public, view-only transparency report</span>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search work, location or category..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
          />
        </div>
      </div>

      {filteredWorks.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <Camera className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <h2 className="text-lg font-black text-slate-900">No public work found</h2>
          <p className="mt-1 text-sm text-slate-500">Published work and photos will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredWorks.map(work => {
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
                    {work.images.slice(0, 3).map((image, index) => (
                      <button
                        key={`${work.id}-${index}`}
                        type="button"
                        onClick={() => setViewer({ work, index })}
                        className={`group relative overflow-hidden bg-slate-200 ${work.images.length === 3 && index === 0 ? 'row-span-2' : ''}`}
                        aria-label={`View ${work.title} photo ${index + 1}`}
                      >
                        <img
                          src={image}
                          alt={`${work.title} – work photo ${index + 1}`}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        {index === 2 && work.images.length > 3 && (
                          <span className="absolute inset-0 flex items-center justify-center bg-slate-950/60 text-xl font-black text-white">
                            +{work.images.length - 3} photos
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-5 sm:p-7">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-extrabold ${statusStyles}`}>
                          {work.status === 'COMPLETED' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                          {STATUS_LABELS[work.status]}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
                          {CATEGORY_LABELS[work.category]}
                        </span>
                      </div>

                      <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{work.title}</h2>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          {new Date(work.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
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
                            Bill/Voucher: {work.receiptNote}
                          </span>
                        )}
                      </div>

                      {work.description && <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{work.description}</p>}
                    </div>

                    <div className="flex shrink-0 flex-row items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 md:min-w-48 md:flex-col md:items-end">
                      <div>
                        <span className="block text-[10px] font-black uppercase tracking-wider text-amber-700">Amount spent</span>
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
                        Share
                      </button>
                    </div>
                  </div>
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
