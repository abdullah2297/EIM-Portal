'use client';

import { useMemo, useState } from 'react';
import { employeesService, subTeamsService, teamsService } from '@/services';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useFilters } from '@/hooks/useFilters';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { SearchInput, SelectField } from '@/components/ui/Fields';
import { DataState } from '@/components/ui/StateViews';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { EmployeeCard } from '@/components/cards/EmployeeCard';
import { PAGE_SIZE, ROLE_BANDS } from '@/lib/constants';

const ALL = 'all';
const INITIAL_FILTERS = { teamId: ALL, subTeamId: ALL, role: ALL, sort: 'fullName' };

/**
 * Employee directory: search, three dependent filters, sorting, pagination
 * and a featured strip.
 *
 * Filtering happens server-side through the REST layer so the same rules apply
 * to any other consumer of the API.
 */
export function EmployeeDirectory() {
  const [term, setTerm] = useState('');
  const debouncedTerm = useDebouncedValue(term, 300);
  const { filters, setFilter, resetFilters, activeCount, page, setPage } = useFilters(INITIAL_FILTERS);

  // Reference data (teams / sub-teams) is fetched once.
  const { data: reference } = useAsyncData(async () => {
    const [teams, subTeams] = await Promise.all([
      teamsService.list({ sort: 'order', order: 'asc' }),
      subTeamsService.list(),
    ]);
    return { teams: teams.items, subTeams: subTeams.items };
  }, []);

  // Memoised so the lookup maps below keep stable dependencies.
  const teams = useMemo(() => reference?.teams ?? [], [reference]);
  const subTeams = useMemo(() => reference?.subTeams ?? [], [reference]);

  const { data, error, isLoading, refetch } = useAsyncData(
    () =>
      employeesService.list({
        q: debouncedTerm,
        teamId: filters.teamId,
        subTeamId: filters.subTeamId,
        role: filters.role,
        sort: filters.sort,
        order: 'asc',
        featuredFirst: filters.sort === 'featured' ? 'true' : undefined,
        page,
        pageSize: PAGE_SIZE.employees,
      }),
    [debouncedTerm, filters.teamId, filters.subTeamId, filters.role, filters.sort, page],
  );

  const { data: featuredData } = useAsyncData(
    () => employeesService.list({ featured: 'true', limit: 4 }),
    [],
  );

  const employees = data?.items ?? [];
  const meta = data?.meta ?? null;
  const featured = featuredData?.items ?? [];

  const teamsById = useMemo(() => Object.fromEntries(teams.map((t) => [t.id, t])), [teams]);
  const subTeamsById = useMemo(() => Object.fromEntries(subTeams.map((s) => [s.id, s])), [subTeams]);

  const availableSubTeams =
    filters.teamId === ALL ? subTeams : subTeams.filter((s) => s.teamId === filters.teamId);

  const roleOptions = ROLE_BANDS;

  return (
    <>
      {/* 6. Featured employees --------------------------------------------- */}
      {featured.length ? (
        <section className="section section--tight">
          <div className="container-page">
            <SectionHeading
              eyebrow="Spotlight"
              eyebrowIcon="Star"
              title="Featured colleagues"
              subtitle="People the department is shining a light on this month."
            />
            <div className="grid-auto grid-auto--4">
              {featured.map((employee, index) => (
                <div key={employee.id} className={`u-anim-in u-delay-${index + 1}`}>
                  <EmployeeCard
                    employee={employee}
                    teamName={teamsById[employee.teamId]?.shortName}
                    subTeamName={subTeamsById[employee.subTeamId]?.name}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 1-4. Search and filters -------------------------------------------- */}
      <section className="section section--tight">
        <div className="container-page u-stack u-stack--lg">
          <SectionHeading
            eyebrow="Directory"
            eyebrowIcon="Badge"
            title="Everyone in the department"
            subtitle="Search by name, role, expertise, hobby or interest - then filter by team, sub-team or seniority."
          />

          <div className="filter-bar">
            <SearchInput
              value={term}
              onChange={setTerm}
              placeholder="Search name, expertise, hobbies..."
              label="Search employees"
            />

            <SelectField
              label="Team"
              name="teamId"
              value={filters.teamId}
              onChange={(name, value) => {
                setFilter(name, value);
                setFilter('subTeamId', ALL);
              }}
              options={[
                { value: ALL, label: 'All teams' },
                ...teams.map((team) => ({ value: team.id, label: team.name })),
              ]}
            />

            <SelectField
              label="Sub-team"
              name="subTeamId"
              value={filters.subTeamId}
              onChange={setFilter}
              options={[
                { value: ALL, label: 'All sub-teams' },
                ...availableSubTeams.map((sub) => ({ value: sub.id, label: sub.name })),
              ]}
            />

            <SelectField
              label="Role"
              name="role"
              value={filters.role}
              onChange={setFilter}
              options={[
                { value: ALL, label: 'All roles' },
                ...roleOptions.map((role) => ({ value: role, label: role })),
              ]}
            />

            <div className="filter-bar__footer">
              <span>
                {meta ? (
                  <>
                    <strong>{meta.total}</strong> colleague(s) found
                  </>
                ) : (
                  'Loading...'
                )}
                {activeCount ? ` - ${activeCount} filter(s) applied` : ''}
              </span>
              <span className="u-cluster u-cluster--sm">
                <SelectField
                  name="sort"
                  value={filters.sort}
                  onChange={setFilter}
                  options={[
                    { value: 'fullName', label: 'Sort: Name' },
                    { value: 'jobTitle', label: 'Sort: Job title' },
                    { value: 'joinedDate', label: 'Sort: Joined date' },
                  ]}
                />
                {activeCount || term ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="Cancel"
                    onClick={() => {
                      setTerm('');
                      resetFilters();
                    }}
                  >
                    Reset
                  </Button>
                ) : null}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Employee cards --------------------------------------------------- */}
      <section className="section section--tight">
        <div className="container-page">
          <DataState
            isLoading={isLoading}
            error={error}
            isEmpty={employees.length === 0}
            onRetry={refetch}
            skeletonCount={8}
            skeletonClassName="grid-auto grid-auto--4"
            emptyProps={{
              icon: 'SearchOff',
              title: 'No colleagues match those filters',
              message: 'Try a broader search term, or reset the filters to see everyone.',
              actionLabel: 'Reset filters',
              onAction: () => {
                setTerm('');
                resetFilters();
              },
            }}
          >
            <div className="grid-auto grid-auto--4">
              {employees.map((employee, index) => (
                <div key={employee.id} className={`u-anim-in u-delay-${(index % 8) + 1}`}>
                  <EmployeeCard
                    employee={employee}
                    teamName={teamsById[employee.teamId]?.shortName}
                    subTeamName={subTeamsById[employee.subTeamId]?.name}
                  />
                </div>
              ))}
            </div>
          </DataState>

          {meta ? (
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              total={meta.total}
              pageSize={meta.pageSize}
              onChange={(next) => {
                setPage(next);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : null}
        </div>
      </section>
    </>
  );
}

export default EmployeeDirectory;
