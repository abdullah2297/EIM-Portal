import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingState } from '@/components/ui/StateViews';
import { StoriesBoard } from './StoriesBoard';

export const metadata = {
  title: 'Success Stories',
  description:
    'Inspiring stories about successful projects, employee accomplishments and impactful team contributions.',
};

/** `/success-stories` - project, team and employee success stories. */
export default function SuccessStoriesPage() {
  return (
    <>
      <PageHeader
        title="Success Stories"
        lead="The problems we set out to solve, what we actually did, and what changed as a result."
        breadcrumbs={[{ label: 'Success Stories' }]}
      />
      <Suspense fallback={<LoadingState label="Loading stories..." />}>
        <StoriesBoard />
      </Suspense>
    </>
  );
}
