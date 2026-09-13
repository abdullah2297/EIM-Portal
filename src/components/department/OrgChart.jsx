import { Fragment } from 'react';
import Link from 'next/link';
import { ROUTES, EXECUTIVE_TIERS } from '@/lib/constants';

/**
 * Read-only organisation chart: the C-level reporting chain (CEO -> CFO ->
 * CIO/CDO, per `EXECUTIVE_TIERS` - not tied to one team) -> our department's
 * head -> five main teams -> their sub-teams. Scrolls horizontally on small
 * screens rather than squashing the nodes.
 *
 * @param {{
 *  departmentName: string,
 *  head?: { id: string, fullName: string, jobTitle: string } | null,
 *  executives?: Array<{ id: string, fullName: string, jobTitle: string, role: string, photo?: string|null }>,
 *  teams: Array<{ id: string, name: string, shortName: string, lead?: any, memberCount?: number, subTeams: any[] }>,
 * }} props
 */
export function OrgChart({ departmentName, head, executives = [], teams = [] }) {
  const tiers = EXECUTIVE_TIERS.map((roles) => executives.filter((executive) => roles.includes(executive.role))).filter(
    (tier) => tier.length,
  );

  return (
    <div className="org-chart">
      {tiers.map((tier) => (
        <Fragment key={tier.map((executive) => executive.id).join('-')}>
          <div className="org-branch org-branch--exec">
            {tier.map((executive) => (
              <Link key={executive.id} href={ROUTES.employee(executive.id)} className="org-node org-node--exec">
                <strong>{executive.role}</strong>
                <span>{executive.fullName}</span>
              </Link>
            ))}
          </div>

          <span className="org-connector" aria-hidden="true" />
        </Fragment>
      ))}

      <div className="org-node org-node--root">
        <strong>{departmentName}</strong>
        <span>{head ? `${head.fullName} - ${head.jobTitle}` : 'PLACEHOLDER - department head'}</span>
      </div>

      <span className="org-connector" aria-hidden="true" />

      <div className="org-branch">
        {teams.map((team) => (
          <div className="org-branch__item" key={team.id}>
            <Link href={ROUTES.team(team.id)} className="org-node">
              <strong>{team.shortName}</strong>
              <span>
                {team.lead ? team.lead.fullName : 'PLACEHOLDER - lead'} - {team.memberCount ?? 0} people
              </span>
            </Link>

            <span className="org-connector" aria-hidden="true" />

            <div className="org-children">
              {team.subTeams.map((sub) => (
                <Link key={sub.id} href={ROUTES.subTeam(sub.id)} className="org-leaf">
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrgChart;
