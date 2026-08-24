'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ADMIN_NAV_GROUPS, ADMIN_SCHEMAS } from '@/lib/adminSchemas';
import { authService } from '@/services';
import { useToast } from '@/context/ToastContext';
import { Icon } from '@/components/ui/Icon';
import { Button, IconButton } from '@/components/ui/Button';
import { Brand } from '@/components/layout/Brand';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { ROUTES } from '@/lib/constants';

/**
 * Admin panel chrome: collapsible sidebar, sticky topbar and sign-out.
 * The login screen renders without this shell.
 */
export function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  const currentTitle = (() => {
    if (pathname === ROUTES.admin) return 'Dashboard';
    if (pathname.startsWith('/admin/department')) return 'Department settings';
    if (pathname.startsWith('/admin/employee-accounts')) return 'Employee accounts';
    if (pathname.startsWith('/admin/participation')) return 'Participation';
    if (pathname.startsWith('/admin/learning-dashboard')) return 'L&D Dashboard';
    const segment = pathname.split('/')[2];
    return ADMIN_SCHEMAS[segment]?.labelPlural ?? 'Admin';
  })();

  const handleLogout = async () => {
    try {
      await authService.logout();
      notify('Signed out.', 'success');
      router.push(ROUTES.adminLogin);
      router.refresh();
    } catch {
      notify('We could not sign you out. Please try again.', 'error');
    }
  };

  return (
    <div className="admin-shell">
      {open ? (
        <button
          type="button"
          className="admin-sidebar__backdrop"
          aria-label="Close admin menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside className={`admin-sidebar ${open ? 'admin-sidebar--open' : ''}`.trim()}>
        <div className="admin-sidebar__head">
          <Brand compact href={ROUTES.admin} />
          <IconButton icon="Close" label="Close admin menu" onClick={() => setOpen(false)} className="lg:hidden" />
        </div>

        <nav className="admin-sidebar__nav" aria-label="Admin sections">
          <Link
            href={ROUTES.admin}
            className={`admin-sidebar__link ${pathname === ROUTES.admin ? 'admin-sidebar__link--active' : ''}`.trim()}
          >
            <Icon name="Dashboard" />
            Dashboard
          </Link>

          {ADMIN_NAV_GROUPS.map((group) => {
            const resources = Object.entries(ADMIN_SCHEMAS).filter(([, schema]) => schema.group === group);
            if (!resources.length) return null;

            return (
              <div key={group}>
                <p className="admin-sidebar__group">{group}</p>
                {resources.map(([resource, schema]) => (
                  <Link
                    key={resource}
                    href={ROUTES.adminResource(resource)}
                    className={`admin-sidebar__link ${isActive(ROUTES.adminResource(resource)) ? 'admin-sidebar__link--active' : ''}`.trim()}
                  >
                    <Icon name={schema.icon} />
                    {schema.labelPlural}
                  </Link>
                ))}
                {group === 'Learning & Development' ? (
                  <>
                    <Link
                      href="/admin/participation"
                      className={`admin-sidebar__link ${isActive('/admin/participation') ? 'admin-sidebar__link--active' : ''}`.trim()}
                    >
                      <Icon name="HowToReg" />
                      Participation
                    </Link>
                    <Link
                      href="/admin/learning-dashboard"
                      className={`admin-sidebar__link ${isActive('/admin/learning-dashboard') ? 'admin-sidebar__link--active' : ''}`.trim()}
                    >
                      <Icon name="Insights" />
                      L&amp;D Dashboard
                    </Link>
                  </>
                ) : null}
              </div>
            );
          })}

          <p className="admin-sidebar__group">Settings</p>
          <Link
            href="/admin/department"
            className={`admin-sidebar__link ${isActive('/admin/department') ? 'admin-sidebar__link--active' : ''}`.trim()}
          >
            <Icon name="AccountBalance" />
            Department profile
          </Link>
          <Link
            href="/admin/employee-accounts"
            className={`admin-sidebar__link ${isActive('/admin/employee-accounts') ? 'admin-sidebar__link--active' : ''}`.trim()}
          >
            <Icon name="Login" />
            Employee accounts
          </Link>
          <Link href={ROUTES.home} className="admin-sidebar__link">
            <Icon name="OpenInNew" />
            View the portal
          </Link>
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <IconButton icon="Menu" label="Open admin menu" onClick={() => setOpen(true)} className="lg:hidden" />
          <h1 className="admin-topbar__title">{currentTitle}</h1>
          <span className="ml-auto u-cluster u-cluster--sm">
            <ThemeToggle />
            <Button variant="outline" size="sm" icon="Logout" onClick={handleLogout}>
              Sign out
            </Button>
          </span>
        </header>

        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}

export default AdminShell;
