'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { employeeAuthService } from '@/services';
import { IconButton } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { ROUTES } from '@/lib/constants';

/**
 * Navbar indicator for a signed-in employee - just their photo (the name
 * still rides along as the avatar's `title`/`aria-label` for a tooltip and
 * screen readers), linking to their own profile, plus a log out action.
 * Only rendered once `me` exists; the logged-out state has no header widget
 * any more (see `LandingLoginSection.jsx` - the login form lives at the
 * bottom of the landing page instead, reached via the navbar's "Log in" button).
 *
 * @param {{ me: { id: string, fullName: string, photo?: string|null } }} props
 */
export function LoginWidget({ me }) {
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await employeeAuthService.logout();
      router.push(ROUTES.home);
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="login-widget login-widget--signed-in">
      <Avatar name={me.fullName} src={me.photo} size="sm" href={ROUTES.employee(me.id)} />
      <IconButton icon="Logout" label="Log out" onClick={loggingOut ? undefined : handleLogout} />
    </div>
  );
}

export default LoginWidget;
