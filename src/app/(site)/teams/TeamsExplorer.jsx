'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  achievementsService,
  employeesService,
  subTeamsService,
  teamsService,
} from '@/services';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { SearchInput, ChipFilters } from '@/components/ui/Fields';
import { DataState, EmptyState } from '@/components/ui/StateViews';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, TagList } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TeamCard } from '@/components/cards/TeamCard';
import { SubTeamCard } from '@/components/cards/SubTeamCard';
import { AchievementCard } from '@/components/cards/AchievementCard';
import { EmployeeCard } from '@/components/cards/EmployeeCard';
import { ROUTES } from '@/lib/constants';

/**
 * Interactive team explorer.
 *
 * Selecting a team (or a sub-team) is reflected in the URL, so a view can be
 * shared with a colleague and the browser back button behaves as expected.
 */
export function TeamsExplorer() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedTeamId = searchParams.get('team') ?? '';
  const selectedSubTeamId = searchParams.get('subTeam') ?? '';

  const [term, setTerm] = useState('');
  const debouncedTerm = useDebouncedValue(term, 250);

  const { data, error, isLoading, refetch } = useAsyncData(async () => {
    const [teams, subTeams, employees, achievements] = await Promise.all([
      teamsService.list({ sort: 'order', order: 'asc' }),
      subTeamsService.list(),
      employeesService.list(),
      achievementsService.list(),
    ]);
    return {
      teams: teams.items,
      subTeams: subTeams.items,
      employees: employees.items,
      achievements: achievements.items,
    };
  }, []);

  // Memoised so the derived useMemo hooks below keep stable dependencies.
  const teams = useMemo(() => data?.teams ?? [], [data]);
  const subTeams = useMemo(() => data?.subTeams ?? [], [data]);
  const employees = useMemo(() => data?.employees ?? [], [data]);
  const achievements = useMemo(() => data?.achievements ?? [], [data]);

  const employeesById = useMemo(
    () => Object.fromEntries(employees.map((e) => [e.id, e])),
    [employees],
  );

  /** Applies the free-text filter across teams and their sub-teams. */
  const matchesTerm = useMemo(() => {
    const needle = debouncedTerm.trim().toLowerCase();
    if (!needle) return () => true;
    return (team) => {
      const subs = subTeams.filter((s) => s.teamId === team.id);
      const haystack = [
        team.name,
        team.shortName,
        team.description,
        ...(team.portfolios ?? []),
        ...subs.map((s) => `${s.name} ${s.description} ${(s.focusAreas ?? []).join(' ')}`),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    };
  }, [debouncedTerm, subTeams]);

  const visibleTeams = teams.filter(matchesTerm);
  const selectedTeam = teams.find((t) => t.id === selectedTeamId) ?? null;
  const teamSubTeams = subTeams.filter((s) => s.teamId === selectedTeamId);
  const selectedSubTeam = teamSubTeams.find((s) => s.id === selectedSubTeamId) ?? null;

  const members = employees.filter((employee) =>
    selectedSubTeam
      ? employee.subTeamId === selectedSubTeam.id
      : selectedTeam
        ? employee.teamId === selectedTeam.id
        : false,
  );

  const teamAchievements = achievements.filter((a) => a.teamId === selectedTeamId);

  const setSelection = (teamId, subTeamId) => {
    const params = new URLSearchParams();
    if (teamId) params.set('team', teamId);
    if (subTeamId) params.set('subTeam', subTeamId);
    const qs = params.toString();
    router.push(qs ? `${ROUTES.teams}?${qs}` : ROUTES.teams, { scroll: false });
  };

  // If a shared link points at a team that no longer exists, clear the filter.
  useEffect(() => {
    if (!isLoading && selectedTeamId && teams.length && !selectedTeam) {
      setSelection('', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, selectedTeamId, teams.length]);

  const teamChips = [
    { value: '', label: 'All teams' },
    ...teams.map((team) => ({
      value: team.id,
      label: team.shortName,
      count: employees.filter((e) => e.teamId === team.id).length,
    })),
  ];

  return (
    <>
      {/* 1 + 2. Overview, search and filter -------------------------------- */}
      <section className="section section--tight">
        <div className="container-page u-stack u-stack--lg">
          <SectionHeading
            eyebrow="Teams overview"
            eyebrowIcon="Groups"
            title="Find a team, then meet the people in it"
            subtitle="Search across teams, sub-teams and focus areas, or jump straight to a team below."
          />

          <div className="filter-bar">
            <SearchInput
              value={term}
              onChange={setTerm}
              placeholder="Search teams, sub-teams or focus areas..."
              className="form-grid__full"
            />
            <div className="filter-bar__footer">
              <ChipFilters
                options={teamChips}
                value={selectedTeamId}
                onChange={(value) => setSelection(value, '')}
                ariaLabel="Filter by team"
              />
              {selectedTeamId || term ? (
                <Button
                  variant="ghost"
                  size="sm"
                  icon="Cancel"
                  onClick={() => {
                    setTerm('');
                    setSelection('', '');
                  }}
                >
                  Clear
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main teams ------------------------------------------------------ */}
      <section className="section section--tight">
        <div className="container-page">
          <SectionHeading
            eyebrow="Main teams"
            eyebrowIcon="AccountTree"
            title={selectedTeam ? 'Change team' : 'Main teams'}
            subtitle="Select a team to see its sub-teams, responsibilities, members and achievements."
          />

          <DataState
            isLoading={isLoading}
            error={error}
            isEmpty={visibleTeams.length === 0}
            onRetry={refetch}
            skeletonCount={3}
            emptyProps={{
              icon: 'SearchOff',
              title: 'No teams match your search',
              message: 'Try a different word, or clear the search to see every team.',
              actionLabel: 'Clear search',
              onAction: () => setTerm(''),
            }}
          >
            <div className="grid-auto">
              {visibleTeams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  className="text-left"
                  onClick={() => setSelection(team.id, '')}
                  aria-pressed={team.id === selectedTeamId}
                >
                  <TeamCard
                    team={{
                      ...team,
                      memberCount: employees.filter((e) => e.teamId === team.id).length,
                      subTeamCount: subTeams.filter((s) => s.teamId === team.id).length,
                      lead: employeesById[team.leadId] ?? null,
                    }}
                    href={`${ROUTES.teams}?team=${team.id}`}
                  />
                </button>
              ))}
            </div>
          </DataState>
        </div>
      </section>

      {selectedTeam ? (
        <>
          {/* 4. Sub-teams --------------------------------------------------- */}
          <section className="section section--muted">
            <div className="container-page u-stack u-stack--lg">
              <SectionHeading
                eyebrow={selectedTeam.name}
                eyebrowIcon="Hub"
                title="Sub-teams"
                subtitle="Select a sub-team to narrow the member list below."
                action={
                  selectedSubTeam ? (
                    <Button variant="outline" size="sm" icon="Cancel" onClick={() => setSelection(selectedTeamId, '')}>
                      Clear sub-team
                    </Button>
                  ) : null
                }
              />

              <div className="grid-auto">
                {teamSubTeams.map((sub) => (
                  <SubTeamCard
                    key={sub.id}
                    subTeam={{
                      ...sub,
                      memberCount: employees.filter((e) => e.subTeamId === sub.id).length,
                      lead: employeesById[sub.leadId] ?? null,
                    }}
                    selected={sub.id === selectedSubTeamId}
                    onSelect={(id) => setSelection(selectedTeamId, id === selectedSubTeamId ? '' : id)}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* 5 + 7. Responsibilities and supported portfolios ---------------- */}
          <section className="section">
            <div className="container-page grid-auto grid-auto--2">
              <article className="detail-panel">
                <h3 className="detail-panel__title">
                  <Icon name="FactCheck" />
                  {selectedSubTeam ? 'Sub-team responsibilities' : 'Team responsibilities'}
                </h3>
                <ul className="icon-list">
                  {((selectedSubTeam ?? selectedTeam).responsibilities ?? []).map((item) => (
                    <li className="icon-list__item" key={item}>
                      <span className="icon-list__bullet">
                        <Icon name="CheckCircle" fontSize="inherit" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </article>

              <article className="detail-panel">
                <h3 className="detail-panel__title">
                  <Icon name="BusinessCenter" />
                  Supported portfolios
                </h3>
                <TagList items={(selectedSubTeam ?? selectedTeam).portfolios} />
                {selectedTeam.mission ? (
                  <>
                    <hr className="u-divider" />
                    <p className="quote-block">{selectedTeam.mission}</p>
                  </>
                ) : null}
                {selectedTeam.leadId && employeesById[selectedTeam.leadId] ? (
                  <>
                    <hr className="u-divider" />
                    <Link href={ROUTES.employee(selectedTeam.leadId)} className="u-cluster">
                      <Avatar name={employeesById[selectedTeam.leadId].fullName} size="sm" />
                      <span className="u-stack u-stack--sm">
                        <strong className="u-text-sm">{employeesById[selectedTeam.leadId].fullName}</strong>
                        <span className="u-text-xs u-subtle">Team manager</span>
                      </span>
                    </Link>
                  </>
                ) : null}
              </article>
            </div>
          </section>

          {/* 6. Team members ------------------------------------------------ */}
          <section className="section section--muted">
            <div className="container-page">
              <SectionHeading
                eyebrow="The people"
                eyebrowIcon="Badge"
                title={selectedSubTeam ? `${selectedSubTeam.name} members` : `${selectedTeam.shortName} members`}
                subtitle={`${members.length} colleague(s) in this view.`}
                action={<Button href={ROUTES.employees} variant="outline" iconAfter="ArrowForward">Full directory</Button>}
              />

              {members.length ? (
                <div className="grid-auto grid-auto--4">
                  {members.map((employee) => (
                    <EmployeeCard
                      key={employee.id}
                      employee={employee}
                      teamName={selectedTeam.shortName}
                      subTeamName={subTeams.find((s) => s.id === employee.subTeamId)?.name}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="Badge"
                  title="No members recorded"
                  message="Nobody has been assigned to this team yet. Add colleagues through the admin panel."
                />
              )}
            </div>
          </section>

          {/* 8. Team achievements ------------------------------------------- */}
          <section className="section">
            <div className="container-page">
              <SectionHeading
                eyebrow="Recognition"
                eyebrowIcon="EmojiEvents"
                title="Team achievements"
                subtitle={`Awards and milestones earned by ${selectedTeam.name}.`}
              />

              {teamAchievements.length ? (
                <div className="grid-auto">
                  {teamAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      teamName={selectedTeam.shortName}
                      people={(achievement.employeeIds ?? [])
                        .map((id) => employeesById[id])
                        .filter(Boolean)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="EmojiEvents"
                  title="No achievements recorded yet"
                  message="Achievements added for this team will be celebrated here."
                  actionLabel="See all achievements"
                  actionHref={ROUTES.achievements}
                />
              )}
            </div>
          </section>
        </>
      ) : (
        <section className="section">
          <div className="container-page">
            <EmptyState
              icon="TipsAndUpdates"
              title="Select a team to explore it"
              message="Choose one of the teams above to see its sub-teams, responsibilities, members and achievements."
            />
          </div>
        </section>
      )}

      {/* Sub-teams index when no team is selected --------------------------- */}
      {!selectedTeam && !isLoading ? (
        <section className="section section--muted">
          <div className="container-page">
            <SectionHeading
              eyebrow="All sub-teams"
              eyebrowIcon="Hub"
              title="Every sub-team at a glance"
              subtitle="Fifteen specialist groups across the five main teams."
            />
            <div className="grid-auto">
              {subTeams.map((sub) => {
                const parent = teams.find((t) => t.id === sub.teamId);
                return (
                  <div className="u-stack u-stack--sm" key={sub.id}>
                    <Badge tone="primary">{parent?.shortName ?? 'PLACEHOLDER - team'}</Badge>
                    <SubTeamCard
                      subTeam={{
                        ...sub,
                        memberCount: employees.filter((e) => e.subTeamId === sub.id).length,
                        lead: employeesById[sub.leadId] ?? null,
                      }}
                      onSelect={() => setSelection(sub.teamId, sub.id)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

export default TeamsExplorer;
