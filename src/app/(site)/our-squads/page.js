import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingState } from '@/components/ui/StateViews';
import { OurSquadsHub } from './OurSquadsHub';

export const metadata = {
  title: 'Our Squads',
  description: 'Browse the department by team, sub-team or champion.',
};

/** `/our-squads` - the department's people, organised three ways: teams, sub-teams and champions. */
export default function OurSquadsPage() {
  return (
    <>
      <PageHeader
        title="Our Squads"
        lead="Everyone who makes up the department, organised by team, sub-team and champions."
        breadcrumbs={[{ label: 'Our Squads' }]}
      />
      <Suspense fallback={<LoadingState label="Loading our squads..." />}>
        <OurSquadsHub />
      </Suspense>
    </>
  );
}
