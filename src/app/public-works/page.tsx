import type { Metadata } from 'next';
import { getAllExpenses } from '@/lib/store';
import { PublicWork } from '@/components/PublicWorksGallery';
import { PublicWorksPageClient } from '@/components/PublicWorksPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Public Works / सार्वजनिक कार्य | Vikas Sahayog Samiti',
  description: 'View community work, expenditure, photos and videos. सामुदायिक विकास कार्यों, खर्च, फोटो और वीडियो का सार्वजनिक रिकॉर्ड।',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Work Done by Vikas Sahayog Samiti',
    description: 'Transparent community work reports, expenditure details, photos and videos.',
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
  return <PublicWorksPageClient works={works} />;
}
