'use client';

import { useMemo } from 'react';
import { departmentService, employeesService, subTeamsService, teamsService } from '@/services';
import { useAsyncData } from '@/hooks/useAsyncData';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { DataState } from '@/components/ui/StateViews';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TeamCard } from '@/components/cards/TeamCard';
import { SubTeamCard } from '@/components/cards/SubTeamCard';
import { EmployeeCard } from '@/components/cards/EmployeeCard';
import { ROUTES } from '@/lib/constants';
import { truncate } from '@/lib/format';

const PREVIEW_SIZE = 4;

/**
 * Resolves the spotlight for one section: an admin-curated id list (set on
 * the department profile) wins outright when present; otherwise falls back
 * to featured items first, then whatever comes first in the list - no
 * randomness, so the page looks the same on every visit until an admin
 * curates it or marks something featured.
 */
function resolveSpotlight(curatedIds, itemsById, allItems) {
  const curated = (curatedIds ?? []).map((id) => itemsById[id]).filter(Boolean);
  if (curated.length) return curated.slice(0, PREVIEW_SIZE);

  const featured = allItems.filter((item) => item.featured);
  const rest = allItems.filter((item) => !item.featured);
  return [...featured, ...rest].slice(0, PREVIEW_SIZE);
}

/**
 * "Our Squads" overview: a department-wide header, then a spotlight preview
 * (up to four each, featured first) of teams, sub-teams and champions -
 * each section links through to its own full, searchable directory page.
 */
export function OurSquadsHub() {
  const { data, error, isLoading, refetch } = useAsyncData(async () => {
    const [department, teams, subTeams, employees] = await Promise.all([
      departmentService.get(),
      teamsService.list({ sort: 'order', order: 'asc' }),
      subTeamsService.list(),
      employeesService.list(),
    ]);
    return { department, teams: teams.items, subTeams: subTeams.items, employees: employees.items };
  }, []);

  const department = data?.department ?? null;
  const teams = useMemo(() => data?.teams ?? [], [data]);
  const subTeams = useMemo(() => data?.subTeams ?? [], [data]);
  const employees = useMemo(() => data?.employees ?? [], [data]);

  const teamsById = useMemo(() => Object.fromEntries(teams.map((t) => [t.id, t])), [teams]);
  const employeesById = useMemo(() => Object.fromEntries(employees.map((e) => [e.id, e])), [employees]);

  const teamsWithCounts = useMemo(
    () =>
      teams.map((team) => ({
        ...team,
        memberCount: employees.filter((e) => e.teamId === team.id).length,
        subTeamCount: subTeams.filter((s) => s.teamId === team.id).length,
        lead: employeesById[team.leadId] ?? null,
      })),
    [teams, subTeams, employees, employeesById],
  );

  const subTeamsWithCounts = useMemo(
    () =>
      subTeams.map((sub) => ({
        ...sub,
        memberCount: employees.filter((e) => e.subTeamId === sub.id).length,
        lead: employeesById[sub.leadId] ?? null,
      })),
    [subTeams, employees, employeesById],
  );

  const teamsWithCountsById = useMemo(
    () => Object.fromEntries(teamsWithCounts.map((t) => [t.id, t])),
    [teamsWithCounts],
  );
  const subTeamsWithCountsById = useMemo(
    () => Object.fromEntries(subTeamsWithCounts.map((s) => [s.id, s])),
    [subTeamsWithCounts],
  );

  const previewTeams = resolveSpotlight(department?.overviewTeamIds, teamsWithCountsById, teamsWithCounts);
  const previewSubTeams = resolveSpotlight(department?.overviewSubTeamIds, subTeamsWithCountsById, subTeamsWithCounts);
  const previewChampions = resolveSpotlight(department?.overviewChampionIds, employeesById, employees);

  return (
    <>
      {/* 1. Header description ------------------------------------------------- */}
      <section className="section section--tight">
        <div className="container-page">
          <SectionHeading
            eyebrow="Our Squads"
            eyebrowIcon="Groups"
            title="Teams, sub-teams and the champions behind them"
            subtitle={
              department?.overview
                ? truncate(department.overview.split('\n\n')[0], 220)
                : "The squads that make up the department - who they are, how they're organised, and the colleagues carrying them forward."
            }
          />
        </div>
      </section>

      {/* 2. Main teams ----------------------------------------------------------- */}
      <section className="section section--tight section--muted">
        <div className="container-page u-stack u-stack--lg">
          <SectionHeading
            eyebrow="Squads"
            eyebrowIcon="AccountTree"
            title="Main teams"
            subtitle="Spotlighted from the admin panel, or featured teams by default."
            action={<Button href={ROUTES.teams} variant="outline" iconAfter="ArrowForward">All teams</Button>}
          />
          <DataState
            isLoading={isLoading}
            error={error}
            isEmpty={previewTeams.length === 0}
            onRetry={refetch}
            skeletonCount={4}
            emptyProps={{
              icon: 'AccountTree',
              title: 'No teams yet',
              message: 'Teams added from the admin panel will appear here.',
            }}
          >
            <div className="grid-auto grid-auto--4">
              {previewTeams.map((team) => (
                <TeamCard key={team.id} team={team} href={ROUTES.team(team.id)} />
              ))}
            </div>
          </DataState>
        </div>
      </section>

      {/* 3. Sub-teams -------------------------------------------------------------- */}
      <section className="section section--tight">
        <div className="container-page u-stack u-stack--lg">
          <SectionHeading
            eyebrow="Squads"
            eyebrowIcon="Hub"
            title="Sub-teams"
            subtitle="Spotlighted from the admin panel, or featured sub-teams by default."
            action={<Button href={ROUTES.subTeams} variant="outline" iconAfter="ArrowForward">All sub-teams</Button>}
          />
          <DataState
            isLoading={isLoading}
            error={error}
            isEmpty={previewSubTeams.length === 0}
            onRetry={refetch}
            skeletonCount={4}
            emptyProps={{
              icon: 'Hub',
              title: 'No sub-teams yet',
              message: 'Sub-teams added from the admin panel will appear here.',
            }}
          >
            <div className="grid-auto grid-auto--4">
              {previewSubTeams.map((sub) => (
                <div className="u-stack u-stack--sm" key={sub.id}>
                  <Badge tone="primary">{teamsById[sub.teamId]?.shortName ?? 'PLACEHOLDER - team'}</Badge>
                  <SubTeamCard subTeam={sub} href={ROUTES.subTeam(sub.id)} />
                </div>
              ))}
            </div>
          </DataState>
        </div>
      </section>

      {/* 4. Champions ---------------------------------------------------------------- */}
      <section className="section section--tight section--muted">
        <div className="container-page u-stack u-stack--lg">
          <SectionHeading
            eyebrow="Squads"
            eyebrowIcon="Star"
            title="Champions"
            subtitle="Spotlighted from the admin panel, or featured colleagues by default."
            action={<Button href={ROUTES.employees} variant="outline" iconAfter="ArrowForward">All champions</Button>}
          />
          <DataState
            isLoading={isLoading}
            error={error}
            isEmpty={previewChampions.length === 0}
            onRetry={refetch}
            skeletonCount={4}
            emptyProps={{
              icon: 'Badge',
              title: 'No champions yet',
              message: 'Colleagues added from the admin panel will appear here.',
            }}
          >
            <div className="grid-auto grid-auto--4">
              {previewChampions.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  teamName={teamsById[employee.teamId]?.shortName}
                />
              ))}
            </div>
          </DataState>
        </div>
      </section>
    </>
  );
}

export default OurSquadsHub;
