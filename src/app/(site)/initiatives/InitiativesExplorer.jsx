'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  achievementsService,
  employeesService,
  initiativesService,
  subTeamsService,
  teamsService,
} from '@/services';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useFilters } from '@/hooks/useFilters';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ChipFilters, SearchInput, SelectField } from '@/components/ui/Fields';
import { DataState } from '@/components/ui/StateViews';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Overlays';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge, TagList } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';
import { InitiativeCard } from '@/components/cards/InitiativeCard';
import { INITIATIVE_CATEGORIES, INITIATIVE_STATUS, PAGE_SIZE, ROUTES } from '@/lib/constants';
import { formatBytes, formatDate } from '@/lib/format';

const ALL = 'all';
const INITIAL_FILTERS = { category: ALL, status: ALL, teamId: ALL };

/**
 * Initiatives explorer with a featured hero, category chips, filters,
 * pagination and a detail modal that covers contributors, impact and any
 * related achievements.
 */
export function InitiativesExplorer() {
  const searchParams = useSearchParams();
  const deepLinkId = searchParams.get('initiative');

  const [term, setTerm] = useState('');
  const debouncedTerm = useDebouncedValue(term, 300);
  const { filters, setFilter, resetFilters, activeCount, page, setPage } = useFilters(INITIAL_FILTERS);
  const [openInitiative, setOpenInitiative] = useState(null);

  const { data: reference } = useAsyncData(async () => {
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

  const teams = useMemo(() => reference?.teams ?? [], [reference]);
  const subTeams = useMemo(() => reference?.subTeams ?? [], [reference]);
  const employees = useMemo(() => reference?.employees ?? [], [reference]);
  const achievements = useMemo(() => reference?.achievements ?? [], [reference]);

  const teamsById = useMemo(() => Object.fromEntries(teams.map((t) => [t.id, t])), [teams]);
  const subTeamsById = useMemo(() => Object.fromEntries(subTeams.map((s) => [s.id, s])), [subTeams]);
  const employeesById = useMemo(() => Object.fromEntries(employees.map((e) => [e.id, e])), [employees]);

  const teamNamesOf = (initiative) =>
    (initiative?.teamIds ?? []).map((id) => teamsById[id]).filter(Boolean);
  const subTeamNamesOf = (initiative) =>
    (initiative?.subTeamIds ?? []).map((id) => subTeamsById[id]).filter(Boolean);

  const { data: featuredData } = useAsyncData(
    () => initiativesService.list({ featured: 'true', limit: 1 }),
    [],
  );
  const featured = featuredData?.items?.[0] ?? null;

  const { data, error, isLoading, refetch } = useAsyncData(
    () =>
      initiativesService.list({
        q: debouncedTerm,
        category: filters.category,
        status: filters.status,
        teamIds: filters.teamId,
        sort: 'startDate',
        order: 'desc',
        page,
        pageSize: PAGE_SIZE.cards,
      }),
    [debouncedTerm, filters.category, filters.status, filters.teamId, page],
  );

  const initiatives = data?.items ?? [];
  const meta = data?.meta ?? null;

  // Support `/initiatives?initiative=ini-002` deep links from global search.
  useEffect(() => {
    if (!deepLinkId) return;
    initiativesService
      .get(deepLinkId)
      .then(setOpenInitiative)
      .catch(() => setOpenInitiative(null));
  }, [deepLinkId]);

  const contributorsOf = (initiative) =>
    (initiative?.contributorIds ?? []).map((id) => employeesById[id]).filter(Boolean);

  const relatedAchievements = openInitiative
    ? achievements.filter(
        (achievement) =>
          (openInitiative.relatedAchievementIds ?? []).includes(achievement.id) ||
          (achievement.teamIds ?? []).some((id) => (openInitiative.teamIds ?? []).includes(id)),
      ).slice(0, 3)
    : [];

  return (
    <>
      {/* 1. Featured initiative --------------------------------------------- */}
      {featured ? (
        <section className="section section--tight">
          <div className="container-page">
            <SectionHeading
              eyebrow="Spotlight"
              eyebrowIcon="RocketLaunch"
              title="Featured initiative"
              subtitle="The initiative the department is putting its weight behind right now."
            />
            <article className="story-card story-card--featured">
              <div className="card__media">
                <MediaPlaceholder src={featured.image} alt={featured.title} icon="Lightbulb" variant="brand" />
              </div>
              <div className="card__body">
                <div className="u-cluster u-cluster--sm">
                  <Badge tone="accent">{featured.category}</Badge>
                  <StatusBadge status={featured.status} />
                </div>
                <h3 className="card__title">{featured.title}</h3>
                <p className="card__subtitle">
                  {teamNamesOf(featured).map((team) => team.name).join(', ')}
                </p>
                <p className="u-muted">{featured.summary}</p>

                {featured.impact?.length ? (
                  <div className="impact-strip">
                    {featured.impact.map((metric) => (
                      <div className="impact-strip__item" key={metric.label}>
                        <strong>{metric.value}</strong>
                        <span>{metric.label}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="u-cluster">
                  <Button icon="Visibility" onClick={() => setOpenInitiative(featured)}>
                    View full details
                  </Button>
                  <TagList items={featured.tags} />
                </div>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      {/* 3. Categories + filters --------------------------------------------- */}
      <section className="section section--tight">
        <div className="container-page u-stack u-stack--lg">
          <SectionHeading
            eyebrow="Innovation"
            eyebrowIcon="Lightbulb"
            title="All initiatives"
            subtitle="Ideas raised, built and delivered by colleagues across the department."
          />

          <ChipFilters
            options={[
              { value: ALL, label: 'All categories' },
              ...INITIATIVE_CATEGORIES.map((category) => ({ value: category, label: category })),
            ]}
            value={filters.category}
            onChange={(value) => setFilter('category', value)}
            ariaLabel="Filter by category"
          />

          <div className="filter-bar">
            <SearchInput value={term} onChange={setTerm} placeholder="Search initiatives..." />
            <SelectField
              label="Status"
              name="status"
              value={filters.status}
              onChange={setFilter}
              options={[
                { value: ALL, label: 'All statuses' },
                ...Object.values(INITIATIVE_STATUS).map((status) => ({ value: status, label: status })),
              ]}
            />
            <SelectField
              label="Team"
              name="teamId"
              value={filters.teamId}
              onChange={setFilter}
              options={[
                { value: ALL, label: 'All teams' },
                ...teams.map((team) => ({ value: team.id, label: team.shortName })),
              ]}
            />
            <div className="filter-bar__footer">
              <span>
                {meta ? (
                  <>
                    <strong>{meta.total}</strong> initiative(s)
                  </>
                ) : (
                  'Loading...'
                )}
              </span>
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
                  Reset filters
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* 2. All initiatives --------------------------------------------------- */}
      <section className="section section--tight">
        <div className="container-page">
          <DataState
            isLoading={isLoading}
            error={error}
            isEmpty={initiatives.length === 0}
            onRetry={refetch}
            skeletonCount={6}
            emptyProps={{
              icon: 'Lightbulb',
              title: 'No initiatives match those filters',
              message: 'Try another category or reset the filters to see everything.',
              actionLabel: 'Reset filters',
              onAction: () => {
                setTerm('');
                resetFilters();
              },
            }}
          >
            <div className="grid-auto">
              {initiatives.map((initiative, index) => (
                <div key={initiative.id} className={`u-anim-in u-delay-${(index % 9) + 1}`}>
                  <InitiativeCard
                    initiative={initiative}
                    teamName={teamNamesOf(initiative).map((team) => team.name).join(', ')}
                    contributors={contributorsOf(initiative)}
                    onOpen={setOpenInitiative}
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
              onChange={setPage}
            />
          ) : null}
        </div>
      </section>

      {/* 4-7. Initiative details, contributors, impact, related achievements -- */}
      <Modal
        open={Boolean(openInitiative)}
        onClose={() => setOpenInitiative(null)}
        title={openInitiative?.title ?? ''}
        maxWidth="md"
        actions={
          <Button variant="outline" onClick={() => setOpenInitiative(null)}>
            Close
          </Button>
        }
      >
        {openInitiative ? (
          <div className="u-stack">
            <div className="u-cluster u-cluster--sm">
              <Badge tone="accent">{openInitiative.category}</Badge>
              <StatusBadge status={openInitiative.status} />
              {teamNamesOf(openInitiative).length ? (
                teamNamesOf(openInitiative).map((team) => (
                  <Badge key={team.id} tone="primary" icon="Groups">
                    {team.name}
                  </Badge>
                ))
              ) : (
                <Badge tone="primary" icon="Groups">
                  PLACEHOLDER - team
                </Badge>
              )}
              {subTeamNamesOf(openInitiative).map((subTeam) => (
                <Badge key={subTeam.id} tone="neutral" icon="Hub">
                  {subTeam.name}
                </Badge>
              ))}
            </div>

            <dl className="detail-list">
              <div className="detail-list__row">
                <dt>Objective</dt>
                <dd>{openInitiative.objective}</dd>
              </div>
              <div className="detail-list__row">
                <dt>Timeline</dt>
                <dd>
                  {formatDate(openInitiative.startDate, 'short')} - {formatDate(openInitiative.endDate, 'short')}
                </dd>
              </div>
            </dl>

            <div className="prose prose--wide">
              {String(openInitiative.description ?? '')
                .split('\n\n')
                .map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
            </div>

            {openInitiative.attachment ? (
              <a
                className="btn btn--outline btn--sm"
                href={`${openInitiative.attachment.url}?name=${encodeURIComponent(openInitiative.attachment.name)}`}
              >
                <Icon name="FolderZip" fontSize="inherit" />
                Download detailed brief ({formatBytes(openInitiative.attachment.size)})
              </a>
            ) : null}

            {openInitiative.impact?.length ? (
              <>
                <h4>Impact</h4>
                <div className="impact-strip">
                  {openInitiative.impact.map((metric) => (
                    <div className="impact-strip__item" key={metric.label}>
                      <strong>{metric.value}</strong>
                      <span>{metric.label}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            <h4>Contributors</h4>
            <div className="u-cluster">
              {contributorsOf(openInitiative).map((person) => (
                <Link key={person.id} href={ROUTES.employee(person.id)} className="u-cluster u-cluster--sm">
                  <Avatar name={person.fullName} src={person.photo} size="sm" />
                  <span className="u-text-sm">{person.fullName}</span>
                </Link>
              ))}
            </div>

            {relatedAchievements.length ? (
              <>
                <h4>Related achievements</h4>
                <ul className="icon-list">
                  {relatedAchievements.map((achievement) => (
                    <li className="icon-list__item" key={achievement.id}>
                      <span className="icon-list__bullet">
                        <Icon name="EmojiEvents" fontSize="inherit" />
                      </span>
                      {achievement.title}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <TagList items={openInitiative.tags} />
          </div>
        ) : null}
      </Modal>
    </>
  );
}

export default InitiativesExplorer;
