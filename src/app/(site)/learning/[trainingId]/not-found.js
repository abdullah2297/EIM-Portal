import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/StateViews';
import { ROUTES } from '@/lib/constants';

/** Shown when a training id in the URL does not exist or is not published. */
export default function TrainingNotFound() {
  return (
    <>
      <PageHeader
        title="Training not found"
        lead="That training is no longer available."
        breadcrumbs={[{ label: 'L&D', href: ROUTES.learning }, { label: 'Not found' }]}
      />
      <section className="section">
        <div className="container-page">
          <EmptyState
            icon="SearchOff"
            title="We could not find that training"
            message="It may have been removed or is not published yet, or the link may be out of date."
            actionLabel="Back to all training"
            actionHref={ROUTES.learning}
          />
        </div>
      </section>
    </>
  );
}
