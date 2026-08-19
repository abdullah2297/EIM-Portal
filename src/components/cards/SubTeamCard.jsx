import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { TagList } from '@/components/ui/Badge';

/**
 * Sub-team card. Selectable when `onSelect` is supplied, so the teams page can
 * drill from a main team into one of its sub-teams.
 *
 * @param {{
 *  subTeam: import('@/lib/types').SubTeam & { memberCount?: number, lead?: any },
 *  selected?: boolean,
 *  onSelect?: (id: string) => void,
 * }} props
 */
export function SubTeamCard({ subTeam, selected = false, onSelect }) {
  const interactive = typeof onSelect === 'function';

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
          <span className="u-cluster u-cluster--sm">
            <Avatar name={subTeam.lead.fullName} src={subTeam.lead.photo} size="xs" />
            {subTeam.lead.fullName}
          </span>
        ) : (
          <span className="card__meta-item">
            <Icon name="Person" fontSize="inherit" />
            PLACEHOLDER - lead to be assigned
          </span>
        )}
      </div>
    </>
  );

  if (interactive) {
    return (
      <button
        type="button"
        className={`card card--interactive text-left ${selected ? 'card--accent-bar' : ''}`.trim()}
        onClick={() => onSelect(subTeam.id)}
        aria-pressed={selected}
      >
        <div className="card__body">{body}</div>
      </button>
    );
  }

  return (
    <article className="card">
      <div className="card__body">{body}</div>
    </article>
  );
}

export default SubTeamCard;
