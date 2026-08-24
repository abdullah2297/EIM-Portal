import { EmployeeAccountsPanel } from './EmployeeAccountsPanel';

export const metadata = {
  title: 'Employee accounts - Admin',
  robots: { index: false, follow: false },
};

/** `/admin/employee-accounts` - create and manage employee logins and their site permissions. */
export default function AdminEmployeeAccountsPage() {
  return (
    <>
      <div className="admin-page-head">
        <div className="u-stack u-stack--sm">
          <h2 className="u-display">Employee accounts</h2>
          <p className="u-text-sm u-muted">
            There is no self-service signup - create every employee's login here, and choose
            which parts of the site they can see. Resetting or changing permissions takes
            effect immediately, even for someone already logged in.
          </p>
        </div>
      </div>

      <EmployeeAccountsPanel />
    </>
  );
}
