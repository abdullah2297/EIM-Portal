import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingState } from '@/components/ui/StateViews';
import { TeamsExplorer } from './TeamsExplorer';

export const metadata = {
  title: 'Teams',
  description: 'Explore the department by team - each team page covers its sub-teams, members, initiatives and achievements.',
};

/** `/teams` - searchable team directory; each card opens that team's own page. */
export default function TeamsPage() {
  return (
    <>
      <PageHeader
        title="Teams"
        lead="Search or browse every team. Open a team to see its sub-teams, members, initiatives and achievements."
        breadcrumbs={[{ label: 'Teams' }]}
      />
      <Suspense fallback={<LoadingState label="Loading teams..." />}>
        <TeamsExplorer />
      </Suspense>
    </>
  );
}
