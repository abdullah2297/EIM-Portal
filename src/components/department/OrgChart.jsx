import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

/**
 * Read-only organisation chart: department head -> five main teams ->
 * their sub-teams. Scrolls horizontally on small screens rather than
 * squashing the nodes.
 *
 * @param {{
 *  departmentName: string,
 *  head?: { id: string, fullName: string, jobTitle: string } | null,
 *  teams: Array<{ id: string, name: string, shortName: string, lead?: any, memberCount?: number, subTeams: any[] }>,
 * }} props
 */
export function OrgChart({ departmentName, head, teams = [] }) {
  return (
    <div className="org-chart">
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
