import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingState } from '@/components/ui/StateViews';
import { InitiativesExplorer } from './InitiativesExplorer';

export const metadata = {
  title: 'Initiatives & Innovation',
  description:
    'Innovative ideas, improvement projects and employee contributions across the Data Warehouse Department.',
};

/** `/initiatives` - department initiatives with categories, filters and detail modal. */
export default function InitiativesPage() {
  return (
    <>
      <PageHeader
        title="Initiatives & Innovation"
        lead="Ideas that started with a colleague noticing something could be better - and then doing something about it."
        breadcrumbs={[{ label: 'Initiatives' }]}
      />
      <Suspense fallback={<LoadingState label="Loading initiatives..." />}>
        <InitiativesExplorer />
      </Suspense>
    </>
  );
}
