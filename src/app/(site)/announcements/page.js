import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingState } from '@/components/ui/StateViews';
import { AnnouncementsBoard } from './AnnouncementsBoard';

export const metadata = {
  title: 'Announcements & News',
  description: 'Department announcements, important updates, events and news.',
};

/** `/announcements` - the department's central communication hub. */
export default function AnnouncementsPage() {
  return (
    <>
      <PageHeader
        title="Announcements & News"
        lead="Everything happening across the department - updates, events, releases and celebrations."
        breadcrumbs={[{ label: 'News' }]}
      />
      <Suspense fallback={<LoadingState label="Loading announcements..." />}>
        <AnnouncementsBoard />
      </Suspense>
    </>
  );
}
