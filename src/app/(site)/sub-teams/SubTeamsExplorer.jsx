'use client';

import { useMemo, useState } from 'react';
import { employeesService, subTeamsService, teamsService } from '@/services';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { SearchInput } from '@/components/ui/Fields';
import { DataState } from '@/components/ui/StateViews';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SubTeamCard } from '@/components/cards/SubTeamCard';
import { ROUTES } from '@/lib/constants';

/**
 * Sub-teams directory: a featured strip, then every sub-team, searchable.
 * Each card links straight to that sub-team's own page.
 */
export function SubTeamsExplorer() {
  const [term, setTerm] = useState('');
  const debouncedTerm = useDebouncedValue(term, 300);

  const { data, error, isLoading, refetch } = useAsyncData(async () => {
    const [subTeams, teams, employees] = await Promise.all([
      subTeamsService.list({ q: debouncedTerm, sort: 'name', order: 'asc' }),
      teamsService.list({ sort: 'order', order: 'asc' }),
      employeesService.list(),
    ]);
    return { subTeams: subTeams.items, teams: teams.items, employees: employees.items };
  }, [debouncedTerm]);

  const { data: featuredData } = useAsyncData(
    () => subTeamsService.list({ featured: 'true', sort: 'name', order: 'asc' }),
    [],
  );

  const subTeams = useMemo(() => data?.subTeams ?? [], [data]);
  const teams = useMemo(() => data?.teams ?? [], [data]);
  const employees = useMemo(() => data?.employees ?? [], [data]);
  const featured = featuredData?.items ?? [];

  const teamsById = useMemo(() => Object.fromEntries(teams.map((t) => [t.id, t])), [teams]);
  const employeesById = useMemo(() => Object.fromEntries(employees.map((e) => [e.id, e])), [employees]);

  const withCounts = (sub) => ({
    ...sub,
    memberCount: employees.filter((e) => e.subTeamId === sub.id).length,
    lead: employeesById[sub.leadId] ?? null,
  });

  const renderCard = (sub) => (
    <div className="u-stack u-stack--sm" key={sub.id}>
      <Badge tone="primary">{teamsById[sub.teamId]?.shortName ?? 'PLACEHOLDER - team'}</Badge>
      <SubTeamCard subTeam={withCounts(sub)} href={ROUTES.subTeam(sub.id)} />
    </div>
  );

  return (
    <>
      {/* 1. Featured sub-teams -------------------------------------------------- */}
      {featured.length ? (
        <section className="section section--tight">
          <div className="container-page">
            <SectionHeading
              eyebrow="Spotlight"
              eyebrowIcon="Star"
              title="Featured sub-teams"
              subtitle="Sub-teams the department is putting in the spotlight right now."
            />
            <div className="grid-auto">{featured.map(renderCard)}</div>
          </div>
        </section>
      ) : null}

      {/* 2. All sub-teams ---------------------------------------------------------- */}
      <section className="section section--tight">
        <div className="container-page u-stack u-stack--lg">
          <SectionHeading
            eyebrow="Directory"
            eyebrowIcon="Hub"
            title="All sub-teams"
            subtitle="Search by name, description or focus area."
          />

          <div className="filter-bar">
            <SearchInput
              value={term}
              onChange={setTerm}
              placeholder="Search sub-teams..."
              className="form-grid__full"
            />
            <div className="filter-bar__footer">
              <span>{subTeams.length} sub-team(s) found</span>
              {term ? (
                <Button variant="ghost" size="sm" icon="Cancel" onClick={() => setTerm('')}>
                  Clear
                </Button>
              ) : null}
            </div>
          </div>

          <DataState
            isLoading={isLoading}
            error={error}
            isEmpty={subTeams.length === 0}
            onRetry={refetch}
            skeletonCount={3}
            emptyProps={{
              icon: 'SearchOff',
              title: 'No sub-teams match your search',
              message: 'Try a different word, or clear the search to see every sub-team.',
              actionLabel: 'Clear search',
              onAction: () => setTerm(''),
            }}
          >
            <div className="grid-auto">{subTeams.map(renderCard)}</div>
          </DataState>
        </div>
      </section>
    </>
  );
}

export default SubTeamsExplorer;
