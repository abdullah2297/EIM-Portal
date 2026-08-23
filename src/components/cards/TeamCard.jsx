import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { TagList } from '@/components/ui/Badge';
import { ROUTES } from '@/lib/constants';

/**
 * Main-team summary card.
 *
 * @param {{
 *  team: import('@/lib/types').Team & { memberCount?: number, subTeamCount?: number, lead?: any },
 *  href?: string,
 * }} props
 */
export function TeamCard({ team, href }) {
  const target = href ?? ROUTES.team(team.id);

  return (
    <article className="team-card">
      {team.featured ? (
        <span className="card__featured-badge" title="Featured team">
          <Icon name="WorkspacePremium" fontSize="small" />
        </span>
      ) : null}

      <span className="team-card__icon">
        <Icon name={team.icon} fontSize="medium" />
      </span>

      <h3 className="team-card__title">
        <Link href={target}>{team.name}</Link>
      </h3>
      <p className="team-card__text">{team.description}</p>

      <TagList items={team.portfolios} max={2} />

      <div className="team-card__stats">
        <span className="team-card__stat">
          <strong>{team.memberCount ?? 0}</strong>
          <span>Members</span>
        </span>
        <span className="team-card__stat">
          <strong>{team.subTeamCount ?? 0}</strong>
          <span>Sub-teams</span>
        </span>
        {team.lead ? (
          <Link href={ROUTES.employee(team.lead.id)} className="u-cluster u-cluster--sm ml-auto">
            <Avatar name={team.lead.fullName} src={team.lead.photo} size="sm" />
            <span className="u-text-xs u-subtle">{team.lead.fullName}</span>
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export default TeamCard;
