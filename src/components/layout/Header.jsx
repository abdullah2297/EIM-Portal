'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Drawer from '@mui/material/Drawer';
import { PRIMARY_NAV, ROUTES, SECONDARY_NAV } from '@/lib/constants';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/Button';
import { DropdownMenu } from '@/components/ui/Overlays';
import { Brand } from './Brand';
import { GlobalSearch } from './GlobalSearch';
import { ThemeToggle } from './ThemeToggle';

/**
 * Sticky site header.
 *
 * Desktop (>= xl): full primary navigation, a "More" dropdown for the
 * secondary items, inline search and the theme toggle.
 * Below xl: hamburger opens a drawer containing everything, including search.
 */
export function Header() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href) =>
    href === ROUTES.home ? pathname === href : pathname.startsWith(href);

  return (
    <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`.trim()}>
      <div className="container-page site-header__inner">
        <Brand />

        <nav className="nav-desktop" aria-label="Primary">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive(item.href) ? 'nav-link--active' : ''}`.trim()}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
          <DropdownMenu
            label="More sections"
            icon="MoreHoriz"
            items={SECONDARY_NAV.map((item) => ({
              key: item.href,
              label: item.label,
              icon: item.icon,
              href: item.href,
            }))}
          />
        </nav>

        <div className="header-actions">
          <GlobalSearch />
          <IconButton icon="Search" label="Search" href={ROUTES.search} className="md:hidden" />
          <ThemeToggle />
          <IconButton
            icon="Menu"
            label="Open navigation menu"
            onClick={() => setDrawerOpen(true)}
            className="nav-toggle"
          />
        </div>
      </div>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <div className="nav-drawer">
          <div className="nav-drawer__head">
            <Brand compact />
            <IconButton icon="Close" label="Close navigation menu" onClick={() => setDrawerOpen(false)} />
          </div>

          <div className="nav-drawer__body">
            <div className="nav-drawer__search">
              <GlobalSearch className="search-input" onSubmitted={() => setDrawerOpen(false)} />
            </div>

            <p className="nav-drawer__group-title">Main sections</p>
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-drawer__link ${isActive(item.href) ? 'nav-drawer__link--active' : ''}`.trim()}
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>
            ))}

            <p className="nav-drawer__group-title">More</p>
            {SECONDARY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-drawer__link ${isActive(item.href) ? 'nav-drawer__link--active' : ''}`.trim()}
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>
            ))}

            <p className="nav-drawer__group-title">Administration</p>
            <Link href={ROUTES.admin} className="nav-drawer__link">
              <Icon name="Settings" />
              Admin panel
            </Link>
          </div>
        </div>
      </Drawer>
    </header>
  );
}

export default Header;
