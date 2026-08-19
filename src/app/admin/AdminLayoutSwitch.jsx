'use client';

import { usePathname } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { ROUTES } from '@/lib/constants';

/** Renders the admin chrome everywhere except the login screen. */
export function AdminLayoutSwitch({ children }) {
  const pathname = usePathname();
  if (pathname === ROUTES.adminLogin) return children;
  return <AdminShell>{children}</AdminShell>;
}

export default AdminLayoutSwitch;
