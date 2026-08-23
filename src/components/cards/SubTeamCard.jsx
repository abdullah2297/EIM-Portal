import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { TagList } from '@/components/ui/Badge';
import { ROUTES } from '@/lib/constants';

/**
 * Sub-team card. Selectable when `onSelect` is supplied (the teams page drills
 * from a main team into one of its sub-teams in place); links to `href` when
 * that's supplied instead (its own dedicated sub-team page) - in that mode the
 * card uses a "stretched link" overlay rather than wrapping everything in an
 * `<a>`, so the lead's own link to their profile stays independently
 * clickable instead of being invalidly nested inside it.
 *
 * @param {{
 *  subTeam: import('@/lib/types').SubTeam & { memberCount?: number, lead?: any },
 *  selected?: boolean,
 *  onSelect?: (id: string) => void,
 *  href?: string,
 * }} props
 */
export function SubTeamCard({ subTeam, selected = false, onSelect, href }) {
  const interactive = typeof onSelect === 'function';

  const featuredBadge = subTeam.featured ? (
    <span className="card__featured-badge" title="Featured sub-team">
      <Icon name="WorkspacePremium" fontSize="small" />
    </span>
  ) : null;

  const body = (
    <>
      <div className="card__header">
        <h3 className="card__title">{subTeam.name}</h3>
        <span className="badge badge--primary">{subTeam.memberCount ?? 0}</span>
      </div>
      <p className="card__text">{subTeam.description}</p>
      <TagList items={subTeam.focusAreas} max={3} />
      <div className="card__meta">
        {subTeam.lead ? (
          <Link href={ROUTES.employee(subTeam.lead.id)} className="u-cluster u-cluster--sm card__lead-link">
            <Avatar name={subTeam.lead.fullName} src={subTeam.lead.photo} size="xs" />
            {subTeam.lead.fullName}
          </Link>
        ) : (
          <span className="card__meta-item">
            <Icon name="Person" fontSize="inherit" />
            PLACEHOLDER - lead to be assigned
          </span>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <div className="card card--interactive">
        <Link href={href} className="card__stretched-link" aria-label={subTeam.name} />
        {featuredBadge}
        <div className="card__body">{body}</div>
      </div>
    );
  }

  if (interactive) {
    return (
      <button
        type="button"
        className={`card card--interactive text-left ${selected ? 'card--accent-bar' : ''}`.trim()}
        onClick={() => onSelect(subTeam.id)}
        aria-pressed={selected}
      >
        {featuredBadge}
        <div className="card__body">{body}</div>
      </button>
    );
  }

  return (
    <article className="card">
      {featuredBadge}
      <div className="card__body">{body}</div>
    </article>
  );
}

export default SubTeamCard;
