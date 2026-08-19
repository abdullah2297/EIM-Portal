import { AdminLayoutSwitch } from './AdminLayoutSwitch';

export const metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

/**
 * Admin section layout. The login screen renders bare; every other admin route
 * is wrapped in the sidebar shell (see AdminLayoutSwitch).
 */
export default function AdminLayout({ children }) {
  return <AdminLayoutSwitch>{children}</AdminLayoutSwitch>;
}
