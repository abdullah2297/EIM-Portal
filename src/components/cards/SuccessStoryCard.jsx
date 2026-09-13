import { Badge } from '@/components/ui/Badge';
import { AvatarStack } from '@/components/ui/Avatar';
import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';
import { Icon } from '@/components/ui/Icon';
import { formatDate } from '@/lib/format';

/**
 * Success story card. `featured` switches to the wide, side-by-side layout.
 *
 * @param {{
 *  story: import('@/lib/types').SuccessStory,
 *  teamName?: string,
 *  contributors?: Array<{ id: string, fullName: string, photo?: string|null }>,
 *  featured?: boolean,
 *  onOpen?: (story: any) => void,
 * }} props
 */
export function SuccessStoryCard({ story, teamName, contributors = [], featured = false, onOpen }) {
  const interactive = typeof onOpen === 'function';

  return (
    <article
      className={`story-card ${featured ? 'story-card--featured' : ''} ${interactive ? 'story-card--interactive' : ''}`.trim()}
      onClick={interactive ? () => onOpen(story) : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onOpen(story);
              }
            }
          : undefined
      }
    >
      <div className="card__media">
        <MediaPlaceholder src={story.coverImage} alt={story.title} icon="AutoStories" variant="brand" />
      </div>

      <div className="card__body">
        <div className="card__header">
          <Badge tone="secondary">{story.type} story</Badge>
          {featured ? <Badge tone="gold" icon="Star">Featured</Badge> : null}
        </div>

        <h3 className="card__title">{story.title}</h3>
        {teamName ? <p className="card__subtitle">{teamName}</p> : null}
        <p className={featured ? 'u-muted u-clamp-4' : 'card__text'}>{story.summary}</p>

        {featured && story.impact?.length ? (
          <div className="impact-strip">
            {story.impact.slice(0, 3).map((metric) => (
              <div className="impact-strip__item" key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="card__meta">
          <span className="card__meta-item">
            <Icon name="CalendarMonth" fontSize="inherit" />
            {formatDate(story.date, 'short')}
          </span>
          <span className="card__meta-item">
            <Icon name="Groups" fontSize="inherit" />
            {story.contributorIds?.length ?? 0} contributors
          </span>
        </div>

        <div className="u-cluster justify-between mt-auto pt-2">
          <AvatarStack people={contributors} max={4} />
          {interactive ? (
            <span className="btn btn--ghost btn--sm" aria-hidden="true">
              Read the story
              <Icon name="ChevronRight" fontSize="inherit" />
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default SuccessStoryCard;
