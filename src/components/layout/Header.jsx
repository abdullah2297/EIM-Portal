'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Drawer from '@mui/material/Drawer';
import { flattenNav, PRIMARY_NAV, ROUTES, SECONDARY_NAV } from '@/lib/constants';
import { Icon } from '@/components/ui/Icon';
import { Button, IconButton } from '@/components/ui/Button';
import { DropdownMenu } from '@/components/ui/Overlays';
import { Brand } from './Brand';
import { GlobalSearch } from './GlobalSearch';
import { LdMegaMenu } from './LdMegaMenu';
import { LoginWidget } from './LoginWidget';
import { ThemeToggle } from './ThemeToggle';

/**
 * Sticky site header.
 *
 * Desktop (>= xl): full primary navigation, a "More" dropdown for the
 * secondary items, inline search and the theme toggle.
 * Below xl: hamburger opens a drawer containing everything, including search.
 *
 * @param {{ logo?: string|null, ldNav?: object, me?: object|null }} props
 */
export function Header({ logo, ldNav, me }) {
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
  const isGroupActive = (children) => children.some((child) => isActive(child.href));
  // Once you're on one of a dropdown's pages, the trigger shows that page's
  // own name/icon instead of the group label - e.g. "Our People" becomes
  // "Teams" while on /teams.
  const activeChild = (children) => children.find((child) => isActive(child.href));
  const flatPrimaryNav = flattenNav(PRIMARY_NAV);

  // "Me" only exists once we know who's logged in, so it's built here rather
  // than living in the static SECONDARY_NAV list in constants.js.
  const moreItems = me
    ? [{ label: 'Me', icon: 'Person', href: ROUTES.employee(me.id) }, ...SECONDARY_NAV]
    : SECONDARY_NAV;

  return (
    <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`.trim()}>
      <div className="container-page site-header__inner">
        <Brand logo={logo} />

        {me ? (
          <nav className="nav-desktop" aria-label="Primary">
            {PRIMARY_NAV.map((item) =>
              item.megaMenu ? (
                <LdMegaMenu key={item.label} ldNav={ldNav} active={isActive(item.href)} />
              ) : item.children ? (
                <DropdownMenu
                  key={item.label}
                  label={activeChild(item.children)?.label ?? item.label}
                  icon={activeChild(item.children)?.icon ?? item.icon}
                  variant="nav"
                  active={isGroupActive(item.children)}
                  items={item.children.map((child) => ({
                    key: child.href,
                    label: child.label,
                    icon: child.icon,
                    href: child.href,
                  }))}
                />
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${isActive(item.href) ? 'nav-link--active' : ''}`.trim()}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  <Icon name={item.icon} fontSize="inherit" />
                  {item.label}
                </Link>
              ),
            )}
            <DropdownMenu
              label={activeChild(moreItems)?.label ?? 'More sections'}
              icon={activeChild(moreItems)?.icon ?? 'MoreHoriz'}
              variant={activeChild(moreItems) ? 'nav' : 'icon'}
              active={isGroupActive(moreItems)}
              items={moreItems.map((item) => ({
                // No icons in this particular dropdown's items - just the label.
                key: item.href,
                label: item.label,
                href: item.href,
              }))}
            />
          </nav>
        ) : (
          // Logged out: the rest of the site is gated, so the only useful
          // places to go are the two teaser sections and the login form
          // further down this same landing page - jump-links, not routes.
          <nav className="nav-desktop nav-desktop--landing" aria-label="Primary">
            <a href="#department" className="nav-link" aria-label="Department">
              <Icon name="AccountBalance" fontSize="inherit" />
              <span className="nav-link__label">Department</span>
            </a>
            <a href="#achievements" className="nav-link" aria-label="Achievements">
              <Icon name="EmojiEvents" fontSize="inherit" />
              <span className="nav-link__label">Achievements</span>
            </a>
            <Button href="#login" size="sm" icon="Login" className="nav-landing-login-btn" ariaLabel="Log in">
              Log in
            </Button>
          </nav>
        )}

        <div className="header-actions">
          <div className="header-search-slot">
            <GlobalSearch collapsible />
          </div>
          {me ? (
            <div className="login-widget-slot">
              <LoginWidget me={me} />
            </div>
          ) : null}
          <ThemeToggle />
          {me ? (
            <IconButton
              icon="Menu"
              label="Open navigation menu"
              onClick={() => setDrawerOpen(true)}
              className="nav-toggle"
            />
          ) : null}
        </div>
      </div>

      {me ? (
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <div className="nav-drawer">
            <div className="nav-drawer__head">
              <Brand compact logo={logo} />
              <IconButton icon="Close" label="Close navigation menu" onClick={() => setDrawerOpen(false)} />
            </div>

            <div className="nav-drawer__body">
              <div className="nav-drawer__search">
                <GlobalSearch className="search-input" onSubmitted={() => setDrawerOpen(false)} />
              </div>

              <p className="nav-drawer__group-title">Main sections</p>
              {flatPrimaryNav.map((item) => (
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
              {moreItems.map((item) => (
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
      ) : null}
    </header>
  );
}

export default Header;
