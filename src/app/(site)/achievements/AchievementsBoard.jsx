'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { achievementsService, employeesService, subTeamsService, teamsService } from '@/services';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ChipFilters, SearchInput } from '@/components/ui/Fields';
import { DataState, EmptyState } from '@/components/ui/StateViews';
import { StatTile } from '@/components/ui/StatTile';
import { Timeline } from '@/components/ui/Timeline';
import { Modal } from '@/components/ui/Overlays';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { AchievementCard } from '@/components/cards/AchievementCard';
import { ACHIEVEMENT_CATEGORIES, ROUTES } from '@/lib/constants';
import { formatDate } from '@/lib/format';

const ALL = 'all';

const SCOPE_SECTIONS = [
  {
    scope: 'Department',
    eyebrow: 'Department-wide',
    icon: 'AccountBalance',
    title: 'Department Achievements & Awards',
    subtitle: 'Recognition earned by the department as a whole.',
    empty: 'No department achievements recorded yet.',
  },
  {
    scope: 'Team',
    eyebrow: 'Together',
    icon: 'Groups',
    title: 'Team Achievements & Awards',
    subtitle: 'What our teams delivered as a unit.',
    empty: 'No team achievements recorded yet.',
  },
  {
    scope: 'Sub-Team',
    eyebrow: 'Specialist groups',
    icon: 'AccountTree',
    title: 'Sub-Team Achievements & Awards',
    subtitle: 'Recognition earned by a specialist group inside a team.',
    empty: 'No sub-team achievements recorded yet.',
  },
  {
    scope: 'Employee',
    eyebrow: 'Individuals',
    icon: 'Person',
    title: 'Employee Achievements & Awards',
    subtitle: 'Colleagues recognised for outstanding individual contribution.',
    empty: 'No individual recognition recorded yet.',
  },
];

/**
 * Achievements board: highlights, filterable award grid, sections grouped by
 * who earned the recognition (department / team / sub-team / employee), and
 * a recognition timeline. Each card opens a detail popup on click.
 */
export function AchievementsBoard() {
  const [term, setTerm] = useState('');
  const [category, setCategory] = useState(ALL);
  const debouncedTerm = useDebouncedValue(term, 250);
  const [openAchievement, setOpenAchievement] = useState(null);

  const { data: reference } = useAsyncData(async () => {
    const [teams, subTeams, employees] = await Promise.all([
      teamsService.list({ sort: 'order', order: 'asc' }),
      subTeamsService.list(),
      employeesService.list(),
    ]);
    return { teams: teams.items, subTeams: subTeams.items, employees: employees.items };
  }, []);

  const teams = useMemo(() => reference?.teams ?? [], [reference]);
  const subTeams = useMemo(() => reference?.subTeams ?? [], [reference]);
  const employees = useMemo(() => reference?.employees ?? [], [reference]);
  const teamsById = useMemo(() => Object.fromEntries(teams.map((t) => [t.id, t])), [teams]);
  const subTeamsById = useMemo(() => Object.fromEntries(subTeams.map((s) => [s.id, s])), [subTeams]);
  const employeesById = useMemo(() => Object.fromEntries(employees.map((e) => [e.id, e])), [employees]);

  const { data, error, isLoading, refetch } = useAsyncData(
    () =>
      achievementsService.list({
        q: debouncedTerm,
        category,
        sort: 'date',
        order: 'desc',
      }),
    [debouncedTerm, category],
  );

  const achievements = useMemo(() => data?.items ?? [], [data]);

  const highlights = achievements.filter((a) => a.featured).slice(0, 3);
  const awards = achievements.filter((a) => a.category === 'Award');
  const milestones = achievements.filter((a) => a.category === 'Milestone');
  const teamAchievements = achievements.filter((a) => a.category === 'Team Achievement');

  const teamsOf = (achievement) =>
    (achievement?.teamIds ?? []).map((id) => teamsById[id]).filter(Boolean);
  const subTeamsOf = (achievement) =>
    (achievement?.subTeamIds ?? []).map((id) => subTeamsById[id]).filter(Boolean);
  const peopleOf = (achievement) =>
    (achievement?.employeeIds ?? []).map((id) => employeesById[id]).filter(Boolean);

  const timelineItems = achievements.slice(0, 12).map((achievement) => ({
    id: achievement.id,
    date: achievement.date,
    title: achievement.title,
    description: achievement.description,
    tone: achievement.category === 'Award' ? 'gold' : 'primary',
    meta: (
      <span className="u-cluster u-cluster--sm">
        <Badge tone="neutral">{achievement.category}</Badge>
        {teamsOf(achievement).map((team) => (
          <Badge key={team.id} tone="primary">
            {team.shortName}
          </Badge>
        ))}
        {peopleOf(achievement).slice(0, 3).map((person) => (
          <Avatar key={person.id} name={person.fullName} src={person.photo} size="xs" />
        ))}
      </span>
    ),
  }));

  const renderGrid = (items, emptyMessage) =>
    items.length ? (
      <div className="grid-auto">
        {items.map((achievement, index) => (
          <div key={achievement.id} className={`u-anim-in u-delay-${(index % 9) + 1}`}>
            <AchievementCard
              achievement={achievement}
              teamName={teamsOf(achievement).map((team) => team.shortName).join(', ')}
              people={peopleOf(achievement)}
              onOpen={setOpenAchievement}
            />
          </div>
        ))}
      </div>
    ) : (
      <EmptyState icon="EmojiEvents" title="Nothing here yet" message={emptyMessage} />
    );

  return (
    <>
      {/* 1. Highlights ------------------------------------------------------- */}
      <section className="section section--tight">
        <div className="container-page u-stack u-stack--lg">
          <SectionHeading
            eyebrow="Celebrating success"
            eyebrowIcon="EmojiEvents"
            title="Achievement highlights"
            subtitle="The results the department is proudest of."
          />

          <div className="grid-auto grid-auto--4">
            <StatTile value={achievements.length} label="Total achievements" icon="EmojiEvents" />
            <StatTile value={awards.length} label="Awards won" icon="MilitaryTech" />
            <StatTile value={milestones.length} label="Milestones reached" icon="Flag" />
            <StatTile value={teamAchievements.length} label="Team achievements" icon="Groups" />
          </div>

          {highlights.length ? renderGrid(highlights, 'Feature an achievement from the admin panel.') : null}
        </div>
      </section>

      {/* Search / filter ------------------------------------------------------ */}
      <section className="section section--tight section--muted">
        <div className="container-page u-stack">
          <div className="filter-bar">
            <SearchInput value={term} onChange={setTerm} placeholder="Search achievements and awards..." />
            <div className="filter-bar__footer">
              <ChipFilters
                options={[
                  { value: ALL, label: 'All' },
                  ...ACHIEVEMENT_CATEGORIES.map((item) => ({ value: item, label: item })),
                ]}
                value={category}
                onChange={setCategory}
                ariaLabel="Filter achievements by category"
              />
              <span>
                <strong>{achievements.length}</strong> result(s)
              </span>
            </div>
          </div>

          <DataState
            isLoading={isLoading}
            error={error}
            isEmpty={achievements.length === 0}
            onRetry={refetch}
            skeletonCount={6}
            emptyProps={{
              icon: 'EmojiEvents',
              title: 'No achievements found',
              message: 'Try another category, or clear the search.',
              actionLabel: 'Clear',
              onAction: () => {
                setTerm('');
                setCategory(ALL);
              },
            }}
          >
            {renderGrid(achievements, 'Record the first achievement from the admin panel.')}
          </DataState>
        </div>
      </section>

      {/* 2-5. Achievements grouped by who earned them ------------------------- */}
      {SCOPE_SECTIONS.map((section, index) => (
        <section className={`section ${index % 2 ? 'section--muted' : ''}`.trim()} key={section.scope}>
          <div className="container-page u-stack u-stack--lg">
            <SectionHeading
              eyebrow={section.eyebrow}
              eyebrowIcon={section.icon}
              title={section.title}
              subtitle={section.subtitle}
            />
            {renderGrid(achievements.filter((a) => a.scope === section.scope), section.empty)}
          </div>
        </section>
      ))}

      {/* 6. Recognition timeline ---------------------------------------------- */}
      <section className="section">
        <div className="container-page">
          <SectionHeading
            eyebrow="History"
            eyebrowIcon="Timeline"
            title="Recognition timeline"
            subtitle="Everything above, in the order it happened."
          />
          {timelineItems.length ? (
            <div className="card">
              <div className="card__body">
                <Timeline items={timelineItems} />
              </div>
            </div>
          ) : (
            <EmptyState icon="Timeline" title="Nothing on the timeline yet" message="Achievements will appear here as they are recorded." />
          )}
        </div>
      </section>

      {/* Detail popup ----------------------------------------------------------- */}
      <Modal
        open={Boolean(openAchievement)}
        onClose={() => setOpenAchievement(null)}
        title={openAchievement?.title ?? ''}
        maxWidth="md"
      >
        {openAchievement ? (
          <div className="u-stack">
            <div className="u-cluster u-cluster--sm">
              <Badge tone="gold">{openAchievement.category}</Badge>
              <Badge tone="neutral">{openAchievement.scope}</Badge>
              <Badge tone="primary" icon="Verified">
                {openAchievement.level}
              </Badge>
            </div>

            {openAchievement.images?.length ? (
              <div className="grid-auto">
                {openAchievement.images.map((src) => (
                  <img key={src} src={src} alt="" className="achievement-gallery__img" />
                ))}
              </div>
            ) : null}

            <p>{openAchievement.description}</p>

            <dl className="detail-list">
              <div className="detail-list__row">
                <dt>Date</dt>
                <dd>{formatDate(openAchievement.date, 'long')}</dd>
              </div>
              <div className="detail-list__row">
                <dt>Issued by</dt>
                <dd>{openAchievement.issuer}</dd>
              </div>
            </dl>

            {teamsOf(openAchievement).length ? (
              <>
                <h4>Teams</h4>
                <div className="u-cluster u-cluster--sm">
                  {teamsOf(openAchievement).map((team) => (
                    <Badge key={team.id} tone="primary" icon="Groups">
                      {team.name}
                    </Badge>
                  ))}
                </div>
              </>
            ) : null}

            {subTeamsOf(openAchievement).length ? (
              <>
                <h4>Sub-teams</h4>
                <div className="u-cluster u-cluster--sm">
                  {subTeamsOf(openAchievement).map((subTeam) => (
                    <Badge key={subTeam.id} tone="neutral" icon="AccountTree">
                      {subTeam.name}
                    </Badge>
                  ))}
                </div>
              </>
            ) : null}

            {peopleOf(openAchievement).length ? (
              <>
                <h4>Employees recognised</h4>
                <div className="u-cluster">
                  {peopleOf(openAchievement).map((person) => (
                    <Link key={person.id} href={ROUTES.employee(person.id)} className="u-cluster u-cluster--sm">
                      <Avatar name={person.fullName} src={person.photo} size="sm" />
                      <span className="u-text-sm">{person.fullName}</span>
                    </Link>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </>
  );
}

export default AchievementsBoard;
