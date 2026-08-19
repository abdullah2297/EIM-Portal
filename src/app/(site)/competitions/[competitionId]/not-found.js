import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/StateViews';
import { ROUTES } from '@/lib/constants';

/** Shown when a competition id in the URL does not exist. */
export default function CompetitionNotFound() {
  return (
    <>
      <PageHeader
        title="Competition not found"
        lead="That competition is no longer available."
        breadcrumbs={[{ label: 'Competitions', href: ROUTES.competitions }, { label: 'Not found' }]}
      />
      <section className="section">
        <div className="container-page">
          <EmptyState
            icon="SportsEsports"
            title="We could not find that competition"
            message="It may have been removed, or the link may be out of date."
            actionLabel="See all competitions"
            actionHref={ROUTES.competitions}
          />
        </div>
      </section>
    </>
  );
}
