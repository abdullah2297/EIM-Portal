import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { formatDate, splitDate } from '@/lib/format';

/**
 * Announcement list card with a compact date chip.
 *
 * @param {{
 *  announcement: import('@/lib/types').Announcement,
 *  author?: { id: string, fullName: string, photo?: string|null } | null,
 *  onOpen?: (announcement: any) => void,
 * }} props
 */
export function AnnouncementCard({ announcement, author, onOpen }) {
  const { day, month } = splitDate(announcement.date);
  const interactive = typeof onOpen === 'function';

  return (
    <article
      className={`announcement-card ${interactive ? 'announcement-card--interactive' : ''}`.trim()}
      onClick={interactive ? () => onOpen(announcement) : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onOpen(announcement);
              }
            }
          : undefined
      }
    >
      <span className="announcement-card__date" aria-hidden="true">
        <strong>{day}</strong>
        <span>{month}</span>
      </span>

      <div className="announcement-card__content">
        <div className="u-cluster u-cluster--sm">
          <Badge tone="primary">{announcement.category}</Badge>
          {announcement.pinned ? (
            <Badge tone="secondary" icon="Flag">
              Pinned
            </Badge>
          ) : null}
        </div>

        <h3 className="card__title">{announcement.title}</h3>

        <p className="card__text">{announcement.summary}</p>

        <div className="card__meta">
          <span className="card__meta-item">
            <Icon name="Schedule" fontSize="inherit" />
            {formatDate(announcement.date, 'short')}
          </span>
          {author ? (
            <span className="card__meta-item">
              <Avatar name={author.fullName} src={author.photo} size="xs" />
              {author.fullName}
            </span>
          ) : null}
          {announcement.attachments?.length ? (
            <span className="card__meta-item">
              <Icon name="AttachFile" fontSize="inherit" />
              {announcement.attachments.length} attachment(s)
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default AnnouncementCard;
