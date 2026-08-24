import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingState } from '@/components/ui/StateViews';
import { LearningExplorer } from './LearningExplorer';

export const metadata = {
  title: 'Learning & Development',
  description: 'Browse and register for training courses run across the department.',
};

/** `/learning` - the full training catalog, searchable and filterable. */
export default function LearningPage() {
  return (
    <>
      <PageHeader
        title="Learning & Development"
        lead="Grow your skills with courses run by colleagues across the department."
        breadcrumbs={[{ label: 'L&D' }]}
      />
      <Suspense fallback={<LoadingState label="Loading the catalog..." />}>
        <LearningExplorer />
      </Suspense>
    </>
  );
}
