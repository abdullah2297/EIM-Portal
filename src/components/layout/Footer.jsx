import Link from 'next/link';
import { flattenNav, PRIMARY_NAV, ROUTES, SECONDARY_NAV, SITE, PLACEHOLDER } from '@/lib/constants';
import { Icon } from '@/components/ui/Icon';
import { Brand } from './Brand';

/**
 * Site footer: brand blurb, navigation columns and contact details.
 * @param {{ logo?: string|null }} props
 */
export function Footer({ logo }) {
  const year = new Date().getFullYear();
  const flatPrimaryNav = flattenNav(PRIMARY_NAV);
  const [mainLinks, moreLinks] = [flatPrimaryNav.slice(0, 5), flatPrimaryNav.slice(5)];

  return (
    <footer className="site-footer">
      <div className="container-page">
        <div className="site-footer__grid">
          <div className="u-stack u-stack--sm">
            <Brand logo={logo} />
            <p className="u-text-sm">{SITE.description}</p>
          </div>

          <div>
            <h4>Explore</h4>
            <div className="site-footer__links">
              {mainLinks.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4>Community</h4>
            <div className="site-footer__links">
              {[...moreLinks, ...SECONDARY_NAV].map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4>Get in touch</h4>
            <div className="site-footer__links">
              <span className="u-cluster u-cluster--sm">
                <Icon name="MailOutline" fontSize="inherit" />
                {PLACEHOLDER.contactEmail}
              </span>
              <span className="u-cluster u-cluster--sm">
                <Icon name="SupportAgent" fontSize="inherit" />
                {PLACEHOLDER.phone}
              </span>
              <span className="u-cluster u-cluster--sm">
                <Icon name="LocationOn" fontSize="inherit" />
                {PLACEHOLDER.location}
              </span>
              <Link href={ROUTES.contact}>Submit an idea or story</Link>
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>
            &copy; {year} {SITE.tagline}. Internal use only.
          </p>
          <p className="u-cluster u-cluster--sm">
            <Link href={ROUTES.search}>Search</Link>
            <span aria-hidden="true">-</span>
            <Link href={ROUTES.admin}>Admin panel</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
