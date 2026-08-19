import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

/**
 * Compact hero used at the top of every inner page.
 *
 * @param {{
 *  title: string,
 *  lead?: string,
 *  breadcrumbs?: Array<{ label: string, href?: string }>,
 *  actions?: import('react').ReactNode,
 *  children?: import('react').ReactNode,
 * }} props
 */
export function PageHeader({ title, lead, breadcrumbs = [], actions, children }) {
  const trail = [{ label: 'Home', href: ROUTES.home }, ...breadcrumbs];

  return (
    <section className="page-header">
      <span className="hero__decor" aria-hidden="true" />
      <div className="container-page page-header__inner">
        <div className="page-header__text">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            {trail.map((crumb, index) => (
              <span key={`${crumb.label}-${crumb.href ?? index}`} className="u-cluster u-cluster--sm">
                {index > 0 ? (
                  <span className="breadcrumbs__sep" aria-hidden="true">
                    /
                  </span>
                ) : null}
                {crumb.href && index < trail.length - 1 ? (
                  <Link href={crumb.href}>{crumb.label}</Link>
                ) : (
                  <span aria-current={index === trail.length - 1 ? 'page' : undefined}>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
          <h1 className="page-header__title">{title}</h1>
          {lead ? <p className="page-header__lead">{lead}</p> : null}
          {children}
        </div>
        {actions ? <div className="u-cluster">{actions}</div> : null}
      </div>
    </section>
  );
}

export default PageHeader;
