import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { formatDate } from '@/lib/format';

/**
 * Appreciation / recognition card for the recognition wall.
 *
 * @param {{
 *  recognition: import('@/lib/types').Recognition,
 *  from?: { fullName: string, photo?: string|null } | null,
 *  to?: { fullName: string, photo?: string|null } | null,
 *  teamName?: string,
 * }} props
 */
export function RecognitionCard({ recognition, from, to, teamName }) {
  return (
    <article className="recognition-card">
      <div className="u-cluster justify-between">
        <Badge tone="gold" icon="Celebration">
          {recognition.type}
        </Badge>
        <span className="u-text-xs u-subtle">{formatDate(recognition.date, 'short')}</span>
      </div>

      <h3 className="card__title">{recognition.title}</h3>
      <p className="recognition-card__quote">"{recognition.message}"</p>

      <div className="recognition-card__people">
        {to ? (
          <span className="u-cluster u-cluster--sm">
            <Avatar name={to.fullName} src={to.photo} size="sm" ringGold />
            <span className="u-stack u-stack--sm">
              <strong className="u-text-sm">{to.fullName}</strong>
              <span className="u-text-xs u-subtle">Recognised</span>
            </span>
          </span>
        ) : (
          <span className="u-cluster u-cluster--sm">
            <span className="avatar avatar--sm">
              <Icon name="Groups" fontSize="inherit" />
            </span>
            <span className="u-stack u-stack--sm">
              <strong className="u-text-sm">{teamName ?? 'PLACEHOLDER - team'}</strong>
              <span className="u-text-xs u-subtle">Team recognition</span>
            </span>
          </span>
        )}

        {from ? (
          <span className="u-cluster u-cluster--sm ml-auto u-text-xs u-subtle">
            <Icon name="Favorite" fontSize="inherit" />
            from {from.fullName}
          </span>
        ) : null}
      </div>
    </article>
  );
}

export default RecognitionCard;
