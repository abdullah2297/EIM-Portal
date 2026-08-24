import Link from 'next/link';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';
import { ROUTES } from '@/lib/constants';
import { formatDate } from '@/lib/format';

const DELIVERY_ICON = { 'On-site': 'LocationOn', Online: 'VideoCameraFront', Hybrid: 'LaptopMac' };

/**
 * Catalog card for one training - mirrors `CompetitionCard`'s block structure
 * (media / body / meta / footer) with a thumbnail plus type, level and status.
 *
 * @param {{ training: import('@/lib/types').Training & { category?: object|null, type?: object|null } }} props
 */
export function TrainingCard({ training }) {
  return (
    <article className="training-card">
      <div className="card__media">
        <MediaPlaceholder src={training.image} alt={training.name} icon="MenuBook" />
      </div>

      <div className="card__body">
        <div className="u-cluster u-cluster--sm">
          <StatusBadge status={training.status} />
          {training.type ? <Badge tone="primary">{training.type.name}</Badge> : null}
          {training.level ? <Badge tone="outline">{training.level}</Badge> : null}
        </div>

        <h3 className="card__title">
          <Link href={ROUTES.learningItem(training.id)}>{training.name}</Link>
        </h3>
        <p className="card__text">{training.shortDescription}</p>

        <div className="card__meta">
          <span className="card__meta-item">
            <Icon name="Person" fontSize="inherit" />
            {training.instructorName || 'PLACEHOLDER - instructor'}
          </span>
          <span className="card__meta-item">
            <Icon name="Event" fontSize="inherit" />
            {formatDate(training.date, 'short')}
          </span>
          {training.duration ? (
            <span className="card__meta-item">
              <Icon name="Schedule" fontSize="inherit" />
              {training.duration}
            </span>
          ) : null}
          {training.deliveryMethod ? (
            <span className="card__meta-item">
              <Icon name={DELIVERY_ICON[training.deliveryMethod] ?? 'LocationOn'} fontSize="inherit" />
              {training.deliveryMethod}
            </span>
          ) : null}
        </div>
      </div>

      <div className="card__footer">
        <span className="u-text-xs u-subtle">{training.category?.name ?? 'PLACEHOLDER - category'}</span>
        <Link href={ROUTES.learningItem(training.id)} className="btn btn--primary btn--sm">
          View details
          <Icon name="ChevronRight" fontSize="inherit" />
        </Link>
      </div>
    </article>
  );
}

export default TrainingCard;
