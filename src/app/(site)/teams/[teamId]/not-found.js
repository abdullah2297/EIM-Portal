import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/StateViews';
import { ROUTES } from '@/lib/constants';

/** Shown when a team id in the URL does not exist. */
export default function TeamNotFound() {
  return (
    <>
      <PageHeader
        title="Team not found"
        lead="That team is no longer available."
        breadcrumbs={[{ label: 'Teams', href: ROUTES.teams }, { label: 'Not found' }]}
      />
      <section className="section">
        <div className="container-page">
          <EmptyState
            icon="SearchOff"
            title="We could not find that team"
            message="The team may have been removed, or the link may be out of date."
            actionLabel="Back to all teams"
            actionHref={ROUTES.teams}
          />
        </div>
      </section>
    </>
  );
}
