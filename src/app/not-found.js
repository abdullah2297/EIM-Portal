import Link from 'next/link';
import { flattenNav, PRIMARY_NAV, ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

export const metadata = { title: 'Page not found' };

/** Global 404 screen for any URL that does not match a route. */
export default function NotFound() {
  return (
    <div className="app-shell">
      <main className="app-main" id="main-content">
        <section className="hero">
          <span className="hero__decor" aria-hidden="true" />
          <div className="container-page hero__content">
            <span className="hero__eyebrow">Error 404</span>
            <h1 className="hero__title">This page has moved or never existed</h1>
            <p className="hero__lead">
              The link may be out of date. Try one of the main sections below, or search the portal.
            </p>
            <div className="hero__actions">
              <Button href={ROUTES.home} variant="gold" size="lg" icon="Home">
                Back to the home page
              </Button>
              <Button href={ROUTES.search} variant="on-dark" size="lg" icon="Search">
                Search the portal
              </Button>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container-page grid-auto grid-auto--4">
            {flattenNav(PRIMARY_NAV).map((item) => (
              <Link key={item.href} href={item.href} className="card card--interactive">
                <div className="card__body">
                  <span className="team-card__icon">
                    <Icon name={item.icon} fontSize="medium" />
                  </span>
                  <h2 className="card__title">{item.label}</h2>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
