import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, Camera, ExternalLink, IndianRupee } from 'lucide-react';
import { getAllExpenses } from '@/lib/store';
import { PublicWorksGallery, PublicWork } from '@/components/PublicWorksGallery';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Public Works | Vikas Sahayog Samiti',
  description: 'View completed and ongoing community work, verified expenditure details and work photos from Vikas Sahayog Samiti.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Work Done by Vikas Sahayog Samiti',
    description: 'Transparent community work reports, expenditure details and photos.',
    type: 'website'
  }
};

export default async function PublicWorksPage() {
  const expenses = await getAllExpenses();
  const works: PublicWork[] = expenses.map(expense => ({
    id: expense.id,
    title: expense.title,
    category: expense.category,
    amount: expense.amount,
    date: expense.date,
    description: expense.description,
    receiptNote: expense.receiptNote,
    images: expense.images || [],
    status: expense.status || 'COMPLETED',
    location: expense.location
  }));
  const totalSpent = works.reduce((total, work) => total + work.amount, 0);
  const worksWithPhotos = works.filter(work => work.images.length > 0).length;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/public-works" className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950">
              <Building2 className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-black sm:text-lg">Vikas Sahayog Samiti</span>
              <span className="block truncate text-xs text-slate-400">Community work transparency portal</span>
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/15"
          >
            Member login
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-14 text-white sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-extrabold text-emerald-300">
              <Camera className="h-4 w-4" />
              PUBLIC WORKS & WORK DONE
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">See the work your community makes possible.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              A public, view-only record of community development work, expenditure and verified site photos.
            </p>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Work records</span>
              <strong className="mt-1 block text-2xl font-black">{works.length}</strong>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">With photos</span>
              <strong className="mt-1 block text-2xl font-black">{worksWithPhotos}</strong>
            </div>
            <div className="col-span-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 backdrop-blur-sm sm:col-span-1">
              <span className="block text-xs font-bold uppercase tracking-wider text-amber-200">Total spent</span>
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
        <p className="font-bold text-slate-700">Vikas Sahayog Samiti</p>
        <p className="mt-1">Public work information only. Member and payment records remain private.</p>
      </footer>
    </main>
  );
}
