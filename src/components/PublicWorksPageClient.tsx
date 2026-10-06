'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, Camera, ExternalLink, IndianRupee, Languages } from 'lucide-react';
import { PublicWork, PublicWorksGallery } from '@/components/PublicWorksGallery';
import { useLanguage } from '@/context/LanguageContext';

interface PublicWorksPageClientProps {
  works: PublicWork[];
}

export const PublicWorksPageClient: React.FC<PublicWorksPageClientProps> = ({ works }) => {
  const { isHindi, language, toggleLanguage } = useLanguage();
  const totalSpent = works.reduce((total, work) => total + work.amount, 0);
  const worksWithPhotos = works.filter(work => work.images.length > 0).length;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/public-works" className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950">
              <Building2 className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-black sm:text-lg">
                {isHindi ? 'विकास सहयोग समिति' : 'Vikas Sahayog Samiti'}
              </span>
              <span className="hidden truncate text-xs text-slate-400 sm:block">
                {isHindi ? 'सामुदायिक कार्य पारदर्शिता पोर्टल' : 'Community work transparency portal'}
              </span>
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-extrabold text-emerald-200 transition hover:bg-emerald-400/15"
              aria-label={isHindi ? 'Switch to English' : 'हिन्दी में बदलें'}
            >
              <Languages className="h-3.5 w-3.5" />
              {language === 'hi' ? 'English' : 'हिन्दी'}
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/15"
            >
              <span className="hidden sm:inline">{isHindi ? 'सदस्य लॉगिन' : 'Member login'}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-14 text-white sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-extrabold text-emerald-300">
              <Camera className="h-4 w-4" />
              {isHindi ? 'सार्वजनिक विकास कार्य और किए गए काम' : 'PUBLIC WORKS & WORK DONE'}
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">
              {isHindi ? 'देखें, आपके सहयोग से समुदाय में क्या काम हो रहा है।' : 'See the work your community makes possible.'}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              {isHindi
                ? 'सामुदायिक विकास कार्यों, खर्च और सत्यापित कार्यस्थल फोटो व वीडियो का सार्वजनिक एवं केवल देखने योग्य रिकॉर्ड।'
                : 'A public, view-only record of community development work, expenditure and verified site photos and videos.'}
            </p>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                {isHindi ? 'कुल कार्य' : 'Work records'}
              </span>
              <strong className="mt-1 block text-2xl font-black">{works.length}</strong>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                {isHindi ? 'फोटो/वीडियो सहित' : 'With media'}
              </span>
              <strong className="mt-1 block text-2xl font-black">{worksWithPhotos}</strong>
            </div>
            <div className="col-span-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 backdrop-blur-sm sm:col-span-1">
              <span className="block text-xs font-bold uppercase tracking-wider text-amber-200">
                {isHindi ? 'कुल खर्च' : 'Total spent'}
              </span>
              <strong className="mt-1 flex items-center text-2xl font-black text-amber-300">
                <IndianRupee className="h-5 w-5" />
                {totalSpent.toLocaleString('en-IN')}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <PublicWorksGallery works={works} />
      </section>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
        <p className="font-bold text-slate-700">{isHindi ? 'विकास सहयोग समिति' : 'Vikas Sahayog Samiti'}</p>
        <p className="mt-1">
          {isHindi
            ? 'यहाँ केवल सार्वजनिक कार्यों की जानकारी है। सदस्य और भुगतान रिकॉर्ड निजी हैं।'
            : 'Public work information only. Member and payment records remain private.'}
        </p>
      </footer>
    </main>
  );
};
