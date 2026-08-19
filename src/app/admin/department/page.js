import { DepartmentForm } from './DepartmentForm';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';

export const metadata = {
  title: 'Department profile - Admin',
  robots: { index: false, follow: false },
};

/** `/admin/department` - editor for the single department profile record. */
export default function AdminDepartmentPage() {
  return (
    <>
      <div className="admin-page-head">
        <div className="u-stack u-stack--sm">
          <h2 className="u-display">Department profile</h2>
          <p className="u-text-sm u-muted">
            The identity, narrative, values, portfolios and contact details used across the portal.
          </p>
        </div>
        <Button href={ROUTES.department} variant="outline" icon="OpenInNew">
          View the department page
        </Button>
      </div>

      <DepartmentForm />
    </>
  );
}
