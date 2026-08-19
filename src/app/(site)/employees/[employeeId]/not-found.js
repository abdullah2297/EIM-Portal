import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/StateViews';
import { ROUTES } from '@/lib/constants';

/** Shown when an employee id in the URL does not exist. */
export default function EmployeeNotFound() {
  return (
    <>
      <PageHeader
        title="Colleague not found"
        lead="That profile is no longer available."
        breadcrumbs={[{ label: 'People', href: ROUTES.employees }, { label: 'Not found' }]}
      />
      <section className="section">
        <div className="container-page">
          <EmptyState
            icon="SearchOff"
            title="We could not find that colleague"
            message="The profile may have been removed, or the link may be out of date."
            actionLabel="Back to the directory"
            actionHref={ROUTES.employees}
          />
        </div>
      </section>
    </>
  );
}
