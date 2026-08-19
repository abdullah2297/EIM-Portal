import Link from 'next/link';
import { ROUTES, SITE } from '@/lib/constants';

/**
 * Portal wordmark. `compact` drops the tagline for tight spaces.
 * @param {{ compact?: boolean, href?: string }} props
 */
export function Brand({ compact = false, href = ROUTES.home }) {
  return (
    <Link href={href} className="brand" aria-label={`${SITE.name} home`}>
      <span className="brand__mark" aria-hidden="true">
        {SITE.shortName}
      </span>
      <span className="brand__text">
        <span className="brand__name">{SITE.name}</span>
        {compact ? null : <span className="brand__tagline">{SITE.tagline}</span>}
      </span>
    </Link>
  );
}

export default Brand;
