import { Badge } from '@/components/ui/Badge';
import { AvatarStack } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { formatDate } from '@/lib/format';

/**
 * Award / achievement badge card.
 *
 * @param {{
 *  achievement: import('@/lib/types').Achievement,
 *  teamName?: string,
 *  people?: Array<{ id: string, fullName: string, photo?: string|null }>,
 *  onOpen?: (achievement: any) => void,
 * }} props
 */
export function AchievementCard({ achievement, teamName, people = [], onOpen }) {
  const interactive = typeof onOpen === 'function';

  return (
    <article className="achievement-card">
      <span className="achievement-card__badge">
        <Icon name={achievement.icon} fontSize="large" />
      </span>

      <Badge tone="gold">{achievement.category}</Badge>
      <h3 className="achievement-card__title">{achievement.title}</h3>
      <p className="achievement-card__text">{achievement.description}</p>

      <div className="card__meta justify-center">
        <span className="card__meta-item">
          <Icon name="CalendarMonth" fontSize="inherit" />
          {formatDate(achievement.date, 'short')}
        </span>
        {teamName ? (
          <span className="card__meta-item">
            <Icon name="Groups" fontSize="inherit" />
            {teamName}
          </span>
        ) : null}
        <span className="card__meta-item">
          <Icon name="Verified" fontSize="inherit" />
          {achievement.level}
        </span>
      </div>

      {people.length ? <AvatarStack people={people} max={4} /> : null}

      {interactive ? (
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => onOpen(achievement)}>
          View details
          <Icon name="ChevronRight" fontSize="inherit" />
        </button>
      ) : null}
    </article>
  );
}

export default AchievementCard;
