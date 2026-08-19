import { AdminDashboard } from './AdminDashboard';

export const metadata = {
  title: 'Admin dashboard',
  robots: { index: false, follow: false },
};

/** `/admin` - dashboard with content counts, quick actions and the inbox. */
export default function AdminHomePage() {
  return <AdminDashboard />;
}
