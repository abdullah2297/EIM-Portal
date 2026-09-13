import { Badge, StatusBadge, TagList } from '@/components/ui/Badge';
import { AvatarStack } from '@/components/ui/Avatar';
import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';
import { Icon } from '@/components/ui/Icon';
import { formatDate } from '@/lib/format';

/**
 * Initiative card.
 *
 * @param {{
 *  initiative: import('@/lib/types').Initiative,
 *  teamName?: string,
 *  contributors?: Array<{ id: string, fullName: string, photo?: string|null }>,
 *  onOpen?: (initiative: any) => void,
 * }} props
 */
export function InitiativeCard({ initiative, teamName, contributors = [], onOpen }) {
  const interactive = typeof onOpen === 'function';

  return (
    <article
      className={`card ${interactive ? 'card--interactive' : ''}`.trim()}
      onClick={interactive ? () => onOpen(initiative) : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onOpen(initiative);
              }
            }
          : undefined
      }
    >
      <div className="card__media">
        <MediaPlaceholder src={initiative.image} alt={initiative.title} icon="Lightbulb" />
      </div>

      <div className="card__body">
        <div className="card__header">
          <Badge tone="accent">{initiative.category}</Badge>
          <StatusBadge status={initiative.status} />
        </div>

        <h3 className="card__title">{initiative.title}</h3>
        {teamName ? <p className="card__subtitle">{teamName}</p> : null}
        <p className="card__text">{initiative.summary}</p>

        <TagList items={initiative.tags} max={3} />

        <div className="card__meta">
          <span className="card__meta-item">
            <Icon name="CalendarMonth" fontSize="inherit" />
            {formatDate(initiative.startDate, 'monthYear')}
          </span>
          <span className="card__meta-item">
            <Icon name="Groups" fontSize="inherit" />
            {initiative.contributorIds?.length ?? 0} contributors
          </span>
        </div>
      </div>

      <div className="card__footer">
        <AvatarStack people={contributors} max={4} />
        {interactive ? (
          <span className="btn btn--ghost btn--sm" aria-hidden="true">
            View details
            <Icon name="ChevronRight" fontSize="inherit" />
          </span>
        ) : null}
      </div>
    </article>
  );
}

export default InitiativeCard;
