import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/StateViews';
import { ROUTES } from '@/lib/constants';

/** Shown when a sub-team id in the URL does not exist. */
export default function SubTeamNotFound() {
  return (
    <>
      <PageHeader
        title="Sub-team not found"
        lead="That sub-team is no longer available."
        breadcrumbs={[{ label: 'Teams', href: ROUTES.teams }, { label: 'Not found' }]}
      />
      <section className="section">
        <div className="container-page">
          <EmptyState
            icon="SearchOff"
            title="We could not find that sub-team"
            message="The sub-team may have been removed, or the link may be out of date."
            actionLabel="Back to all teams"
            actionHref={ROUTES.teams}
          />
        </div>
      </section>
    </>
  );
}
