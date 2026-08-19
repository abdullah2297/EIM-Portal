import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingState } from '@/components/ui/StateViews';
import { TeamsExplorer } from './TeamsExplorer';

export const metadata = {
  title: 'Teams & Sub-Teams',
  description: 'Explore the five main teams and fifteen sub-teams of the Data Warehouse Department.',
};

/** `/teams` - interactive explorer for teams, sub-teams and their members. */
export default function TeamsPage() {
  return (
    <>
      <PageHeader
        title="Teams & Sub-Teams"
        lead="Five main teams, fifteen sub-teams and the colleagues who make them work. Select a team to drill into it."
        breadcrumbs={[{ label: 'Teams' }]}
      />
      <Suspense fallback={<LoadingState label="Loading teams..." />}>
        <TeamsExplorer />
      </Suspense>
    </>
  );
}
