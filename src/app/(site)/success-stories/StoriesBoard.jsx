'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { employeesService, successStoriesService, teamsService } from '@/services';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ChipFilters, SearchInput } from '@/components/ui/Fields';
import { DataState, EmptyState } from '@/components/ui/StateViews';
import { Modal } from '@/components/ui/Overlays';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { SuccessStoryCard } from '@/components/cards/SuccessStoryCard';
import { ROUTES, STORY_TYPES } from '@/lib/constants';
import { formatDate } from '@/lib/format';

const ALL = 'all';

/** Success stories: featured hero, type tabs and a full-story reader modal. */
export function StoriesBoard() {
  const searchParams = useSearchParams();
  const deepLinkId = searchParams.get('story');

  const [term, setTerm] = useState('');
  const [type, setType] = useState(ALL);
  const debouncedTerm = useDebouncedValue(term, 250);
  const [openStory, setOpenStory] = useState(null);

  const { data: reference } = useAsyncData(async () => {
    const [teams, employees] = await Promise.all([
      teamsService.list({ sort: 'order', order: 'asc' }),
      employeesService.list(),
    ]);
    return { teams: teams.items, employees: employees.items };
  }, []);

  const teams = useMemo(() => reference?.teams ?? [], [reference]);
  const employees = useMemo(() => reference?.employees ?? [], [reference]);
  const teamsById = useMemo(() => Object.fromEntries(teams.map((t) => [t.id, t])), [teams]);
  const employeesById = useMemo(() => Object.fromEntries(employees.map((e) => [e.id, e])), [employees]);

  const { data: featuredData } = useAsyncData(
    () => successStoriesService.list({ featured: 'true', limit: 1 }),
    [],
  );
  const featured = featuredData?.items?.[0] ?? null;

  const { data, error, isLoading, refetch } = useAsyncData(
    () => successStoriesService.list({ q: debouncedTerm, type, sort: 'date', order: 'desc' }),
    [debouncedTerm, type],
  );

  const stories = useMemo(() => data?.items ?? [], [data]);

  useEffect(() => {
    if (!deepLinkId) return;
    successStoriesService
      .get(deepLinkId)
      .then(setOpenStory)
      .catch(() => setOpenStory(null));
  }, [deepLinkId]);

  const contributorsOf = (story) =>
    (story?.contributorIds ?? []).map((id) => employeesById[id]).filter(Boolean);

  const byType = (value) => stories.filter((story) => story.type === value);

  const renderGrid = (items, emptyMessage) =>
    items.length ? (
      <div className="grid-auto">
        {items.map((story, index) => (
          <div key={story.id} className={`u-anim-in u-delay-${(index % 9) + 1}`}>
            <SuccessStoryCard
              story={story}
              teamName={teamsById[story.teamId]?.name}
              contributors={contributorsOf(story)}
              onOpen={setOpenStory}
            />
          </div>
        ))}
      </div>
    ) : (
      <EmptyState icon="AutoStories" title="No stories yet" message={emptyMessage} />
    );

  return (
    <>
      {/* 1. Featured success story -------------------------------------------- */}
      {featured ? (
        <section className="section section--tight">
          <div className="container-page">
            <SectionHeading
              eyebrow="Story of the moment"
              eyebrowIcon="AutoStories"
              title="Featured success story"
            />
            <SuccessStoryCard
              story={featured}
              teamName={teamsById[featured.teamId]?.name}
              contributors={contributorsOf(featured)}
              featured
              onOpen={setOpenStory}
            />
          </div>
        </section>
      ) : null}

      {/* 2. Latest stories + filters ------------------------------------------ */}
      <section className="section section--tight section--muted">
        <div className="container-page u-stack u-stack--lg">
          <SectionHeading
            eyebrow="All stories"
            eyebrowIcon="AutoStories"
            title="Latest stories"
            subtitle="Real challenges, the work that solved them and the difference it made."
          />

          <div className="filter-bar">
            <SearchInput value={term} onChange={setTerm} placeholder="Search success stories..." />
            <div className="filter-bar__footer">
              <ChipFilters
                options={[
                  { value: ALL, label: 'All stories' },
                  ...STORY_TYPES.map((item) => ({ value: item, label: `${item} stories` })),
                ]}
                value={type}
                onChange={setType}
                ariaLabel="Filter stories by type"
              />
              <span>
                <strong>{stories.length}</strong> story(s)
              </span>
            </div>
          </div>

          <DataState
            isLoading={isLoading}
            error={error}
            isEmpty={stories.length === 0}
            onRetry={refetch}
            skeletonCount={6}
            emptyProps={{
              icon: 'AutoStories',
              title: 'No stories match',
              message: 'Try a different filter or clear the search.',
              actionLabel: 'Clear',
              onAction: () => {
                setTerm('');
                setType(ALL);
              },
            }}
          >
            {renderGrid(stories, 'Share the first success story from the admin panel.')}
          </DataState>
        </div>
      </section>

      {/* 3-5. Grouped by audience --------------------------------------------- */}
      {[
        ['Employee', 'People', 'Person', 'Employee success stories', 'Individual journeys and personal wins.'],
        ['Team', 'Together', 'Groups', 'Team success stories', 'What our teams achieved as a unit.'],
        ['Project', 'Delivery', 'RocketLaunch', 'Project success stories', 'Projects that changed how the business works.'],
      ].map(([value, eyebrow, icon, title, subtitle]) => (
        <section className="section" key={value}>
          <div className="container-page u-stack u-stack--lg">
            <SectionHeading eyebrow={eyebrow} eyebrowIcon={icon} title={title} subtitle={subtitle} />
            {renderGrid(byType(value), `No ${value.toLowerCase()} stories recorded yet.`)}
          </div>
        </section>
      ))}

      {/* Story reader ---------------------------------------------------------- */}
      <Modal
        open={Boolean(openStory)}
        onClose={() => setOpenStory(null)}
        title={openStory?.title ?? ''}
        maxWidth="md"
        actions={<Button variant="outline" onClick={() => setOpenStory(null)}>Close</Button>}
      >
        {openStory ? (
          <div className="u-stack">
            <div className="u-cluster u-cluster--sm">
              <Badge tone="secondary">{openStory.type} story</Badge>
              <Badge tone="primary">{teamsById[openStory.teamId]?.shortName ?? 'PLACEHOLDER'}</Badge>
              <span className="u-text-xs u-subtle">{formatDate(openStory.date)}</span>
            </div>

            <p className="quote-block">{openStory.summary}</p>

            <div className="u-stack">
              <article className="detail-panel">
                <h4 className="detail-panel__title">
                  <Icon name="ErrorOutline" />
                  The challenge
                </h4>
                <p className="u-text-sm u-muted">{openStory.challenge}</p>
              </article>
              <article className="detail-panel">
                <h4 className="detail-panel__title">
                  <Icon name="TipsAndUpdates" />
                  The solution
                </h4>
                <p className="u-text-sm u-muted">{openStory.solution}</p>
              </article>
              <article className="detail-panel">
                <h4 className="detail-panel__title">
                  <Icon name="TrendingUp" />
                  The result
                </h4>
                <p className="u-text-sm u-muted">{openStory.result}</p>
              </article>
            </div>

            {openStory.impact?.length ? (
              <>
                <h4>Impact</h4>
                <div className="impact-strip">
                  {openStory.impact.map((metric) => (
                    <div className="impact-strip__item" key={metric.label}>
                      <strong>{metric.value}</strong>
                      <span>{metric.label}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {openStory.keyAchievements?.length ? (
              <>
                <h4>Key achievements</h4>
                <ul className="icon-list">
                  {openStory.keyAchievements.map((item) => (
                    <li className="icon-list__item" key={item}>
                      <span className="icon-list__bullet">
                        <Icon name="CheckCircle" fontSize="inherit" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <h4>Contributors</h4>
            <div className="u-cluster">
              {contributorsOf(openStory).map((person) => (
                <Link key={person.id} href={ROUTES.employee(person.id)} className="u-cluster u-cluster--sm">
                  <Avatar name={person.fullName} src={person.photo} size="sm" />
                  <span className="u-text-sm">{person.fullName}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}

export default StoriesBoard;
