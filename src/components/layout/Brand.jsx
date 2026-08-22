import Link from 'next/link';
import { ROUTES, SITE } from '@/lib/constants';

/**
 * Portal wordmark. `compact` drops the tagline for tight spaces. Renders the
 * department's uploaded logo when one is set, falling back to the initials
 * mark otherwise.
 * @param {{ compact?: boolean, href?: string, logo?: string|null }} props
 */
export function Brand({ compact = false, href = ROUTES.home, logo }) {
  return (
    <Link href={href} className="brand" aria-label={`${SITE.name} home`}>
      <span className={`brand__mark ${logo ? 'brand__mark--logo' : ''}`.trim()} aria-hidden="true">
        {logo ? <img src={logo} alt="" className="brand__logo" /> : SITE.shortName}
      </span>
      <span className="brand__text">
        <span className="brand__name">{SITE.name}</span>
        {compact ? null : <span className="brand__tagline">{SITE.tagline}</span>}
      </span>
    </Link>
  );
}

export default Brand;
