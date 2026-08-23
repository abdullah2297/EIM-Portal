import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingState } from '@/components/ui/StateViews';
import { SubTeamsExplorer } from './SubTeamsExplorer';

export const metadata = {
  title: 'Sub-Teams',
  description: 'Explore every specialist sub-team across the department.',
};

/** `/sub-teams` - searchable sub-team directory; each card opens that sub-team's own page. */
export default function SubTeamsPage() {
  return (
    <>
      <PageHeader
        title="Sub-Teams"
        lead="Search or browse every sub-team. Open one to see its members, initiatives and achievements."
        breadcrumbs={[{ label: 'Sub-Teams' }]}
      />
      <Suspense fallback={<LoadingState label="Loading sub-teams..." />}>
        <SubTeamsExplorer />
      </Suspense>
    </>
  );
}
