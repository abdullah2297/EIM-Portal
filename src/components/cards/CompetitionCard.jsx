import Link from 'next/link';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ROUTES } from '@/lib/constants';
import { daysRemaining, formatDate, progressBetween } from '@/lib/format';

/**
 * Competition card used on the home page and the competitions listing.
 *
 * @param {{ competition: import('@/lib/types').Competition }} props
 */
export function CompetitionCard({ competition }) {
  const topPrize = competition.prizes?.[0];
  const isActive = competition.status === 'Active';
  const remaining = daysRemaining(competition.endDate);

  return (
    <article className="competition-card">
      <div className="competition-card__head">
        <div className="u-cluster u-cluster--sm">
          <StatusBadge status={competition.status} pulse />
          <Badge tone="on-dark">{competition.category}</Badge>
        </div>
        <h3 className="competition-card__title">
          <Link href={ROUTES.competition(competition.id)}>{competition.name}</Link>
        </h3>
        {topPrize ? (
          <p className="competition-card__prize">
            <Icon name="CardGiftcard" fontSize="inherit" />
            {topPrize.title}
          </p>
        ) : null}
      </div>

      <div className="competition-card__body">
        <p className="card__text">{competition.summary}</p>

        {isActive ? (
          <ProgressBar
            value={progressBetween(competition.startDate, competition.endDate)}
            label="Time elapsed"
            valueLabel={`${remaining} day(s) left`}
          />
        ) : null}

        <div className="card__meta">
          <span className="card__meta-item">
            <Icon name="Event" fontSize="inherit" />
            {formatDate(competition.startDate, 'short')} - {formatDate(competition.endDate, 'short')}
          </span>
          <span className="card__meta-item">
            <Icon name="HowToReg" fontSize="inherit" />
            {competition.participantIds?.length ?? 0} participants
          </span>
        </div>
      </div>

      <div className="card__footer">
        <span className="u-text-xs u-subtle">
          {competition.prizes?.length ?? 0} prize(s) available
        </span>
        <Link href={ROUTES.competition(competition.id)} className="btn btn--primary btn--sm">
          {isActive ? 'Participate now' : 'View details'}
          <Icon name="ChevronRight" fontSize="inherit" />
        </Link>
      </div>
    </article>
  );
}

export default CompetitionCard;
