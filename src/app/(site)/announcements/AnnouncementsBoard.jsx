'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { announcementsService, employeesService, teamsService } from '@/services';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useFilters } from '@/hooks/useFilters';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ChipFilters, SearchInput, SelectField } from '@/components/ui/Fields';
import { DataState, EmptyState } from '@/components/ui/StateViews';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Overlays';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';
import { AnnouncementCard } from '@/components/cards/AnnouncementCard';
import { ANNOUNCEMENT_CATEGORIES, PAGE_SIZE } from '@/lib/constants';
import { formatDate, splitDate } from '@/lib/format';

const ALL = 'all';
const INITIAL_FILTERS = { category: ALL, teamId: ALL };

/** Announcements, events and department updates with search, filters and a reader modal. */
export function AnnouncementsBoard() {
  const searchParams = useSearchParams();
  const deepLinkId = searchParams.get('announcement');

  const [term, setTerm] = useState('');
  const debouncedTerm = useDebouncedValue(term, 300);
  const { filters, setFilter, resetFilters, activeCount, page, setPage } = useFilters(INITIAL_FILTERS);
  const [openItem, setOpenItem] = useState(null);

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

  const { data: allData } = useAsyncData(
    () => announcementsService.list({ sort: 'date', order: 'desc' }),
    [],
  );
  const all = useMemo(() => allData?.items ?? [], [allData]);

  const featured = all.find((item) => item.featured || item.pinned) ?? all[0] ?? null;
  const upcomingEvents = all
    .filter((item) => item.eventDate && new Date(item.eventDate).getTime() >= Date.now())
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
  const importantUpdates = all.filter((item) => ['Policy', 'Update'].includes(item.category)).slice(0, 4);

  const { data, error, isLoading, refetch } = useAsyncData(
    () =>
      announcementsService.list({
        q: debouncedTerm,
        category: filters.category,
        teamId: filters.teamId,
        sort: 'date',
        order: 'desc',
        page,
        pageSize: PAGE_SIZE.list,
      }),
    [debouncedTerm, filters.category, filters.teamId, page],
  );

  const announcements = data?.items ?? [];
  const meta = data?.meta ?? null;

  useEffect(() => {
    if (!deepLinkId) return;
    announcementsService
      .get(deepLinkId)
      .then(setOpenItem)
      .catch(() => setOpenItem(null));
  }, [deepLinkId]);

  return (
    <>
      {/* 1. Featured announcement -------------------------------------------- */}
      {featured ? (
        <section className="section section--tight">
          <div className="container-page">
            <SectionHeading
              eyebrow="Read this first"
              eyebrowIcon="Campaign"
              title="Featured announcement"
            />
            <article className="story-card story-card--featured">
              <div className="card__media">
                <MediaPlaceholder src={featured.image} alt={featured.title} icon="Campaign" variant="brand" />
              </div>
              <div className="card__body">
                <div className="u-cluster u-cluster--sm">
                  <Badge tone="primary">{featured.category}</Badge>
                  {featured.pinned ? <Badge tone="secondary" icon="Flag">Pinned</Badge> : null}
                  <span className="u-text-xs u-subtle">{formatDate(featured.date)}</span>
                </div>
                <h3 className="card__title">{featured.title}</h3>
                <p className="u-muted">{featured.summary}</p>
                <div className="u-cluster">
                  <Button icon="Visibility" onClick={() => setOpenItem(featured)}>
                    Read the full announcement
                  </Button>
                  {employeesById[featured.authorId] ? (
                    <span className="u-cluster u-cluster--sm">
                      <Avatar name={employeesById[featured.authorId].fullName} size="sm" />
                      <span className="u-text-sm u-subtle">{employeesById[featured.authorId].fullName}</span>
                    </span>
                  ) : null}
                </div>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      {/* 3 + 4. Upcoming events and important updates -------------------------- */}
      <section className="section section--tight section--muted">
        <div className="container-page grid-auto grid-auto--2">
          <div className="u-stack">
            <SectionHeading eyebrow="Diary" eyebrowIcon="Event" title="Upcoming events" as="h2" />
            {upcomingEvents.length ? (
              <div className="u-stack u-stack--sm">
                {upcomingEvents.slice(0, 4).map((item) => {
                  const { day, month } = splitDate(item.eventDate);
                  return (
                    <article className="announcement-card" key={item.id}>
                      <span className="announcement-card__date" aria-hidden="true">
                        <strong>{day}</strong>
                        <span>{month}</span>
                      </span>
                      <div className="announcement-card__content">
                        <Badge tone="accent">{item.category}</Badge>
                        <h3 className="card__title">{item.title}</h3>
                        <p className="card__meta">
                          <span className="card__meta-item">
                            <Icon name="LocationOn" fontSize="inherit" />
                            {item.eventLocation}
                          </span>
                        </p>
                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setOpenItem(item)}>
                          Details
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon="Event" title="No upcoming events" message="Scheduled events will appear here." />
            )}
          </div>

          <div className="u-stack">
            <SectionHeading eyebrow="Do not miss" eyebrowIcon="InfoOutlined" title="Important updates" as="h2" />
            {importantUpdates.length ? (
              <div className="u-stack u-stack--sm">
                {importantUpdates.map((item) => (
                  <AnnouncementCard
                    key={item.id}
                    announcement={item}
                    author={employeesById[item.authorId]}
                    onOpen={setOpenItem}
                  />
                ))}
              </div>
            ) : (
              <EmptyState icon="InfoOutlined" title="No updates" message="Policy and process updates will appear here." />
            )}
          </div>
        </div>
      </section>

      {/* 5 + 6. Categories, search and the full list --------------------------- */}
      <section className="section">
        <div className="container-page u-stack u-stack--lg">
          <SectionHeading
            eyebrow="Everything"
            eyebrowIcon="Campaign"
            title="Latest announcements"
            subtitle="Search or filter the full announcement archive."
          />

          <ChipFilters
            options={[
              { value: ALL, label: 'All categories' },
              ...ANNOUNCEMENT_CATEGORIES.map((item) => ({ value: item, label: item })),
            ]}
            value={filters.category}
            onChange={(value) => setFilter('category', value)}
            ariaLabel="Filter announcements by category"
          />

          <div className="filter-bar">
            <SearchInput value={term} onChange={setTerm} placeholder="Search announcements..." />
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
              <span>{meta ? <><strong>{meta.total}</strong> announcement(s)</> : 'Loading...'}</span>
              {activeCount || term ? (
                <Button variant="ghost" size="sm" icon="Cancel" onClick={() => { setTerm(''); resetFilters(); }}>
                  Reset filters
                </Button>
              ) : null}
            </div>
          </div>

          <DataState
            isLoading={isLoading}
            error={error}
            isEmpty={announcements.length === 0}
            onRetry={refetch}
            skeletonCount={4}
            skeletonClassName="grid-auto grid-auto--2"
            emptyProps={{
              icon: 'Campaign',
              title: 'No announcements match those filters',
              message: 'Try another category or clear the search.',
              actionLabel: 'Reset filters',
              onAction: () => { setTerm(''); resetFilters(); },
            }}
          >
            <div className="grid-auto grid-auto--2">
              {announcements.map((item, index) => (
                <div key={item.id} className={`u-anim-in u-delay-${(index % 8) + 1}`}>
                  <AnnouncementCard
                    announcement={item}
                    author={employeesById[item.authorId]}
                    onOpen={setOpenItem}
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

      {/* Reader modal ---------------------------------------------------------- */}
      <Modal
        open={Boolean(openItem)}
        onClose={() => setOpenItem(null)}
        title={openItem?.title ?? ''}
        maxWidth="md"
        actions={<Button variant="outline" onClick={() => setOpenItem(null)}>Close</Button>}
      >
        {openItem ? (
          <div className="u-stack">
            <div className="u-cluster u-cluster--sm">
              <Badge tone="primary">{openItem.category}</Badge>
              <span className="u-text-xs u-subtle">{formatDate(openItem.date)}</span>
              {teamsById[openItem.teamId] ? (
                <Badge tone="neutral">{teamsById[openItem.teamId].shortName}</Badge>
              ) : null}
            </div>

            {employeesById[openItem.authorId] ? (
              <div className="u-cluster u-cluster--sm">
                <Avatar name={employeesById[openItem.authorId].fullName} size="sm" />
                <span className="u-text-sm">
                  {employeesById[openItem.authorId].fullName} - {employeesById[openItem.authorId].jobTitle}
                </span>
              </div>
            ) : null}

            <div className="prose prose--wide">
              {String(openItem.content ?? '')
                .split('\n\n')
                .map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
            </div>

            {openItem.eventDate ? (
              <dl className="detail-list">
                <div className="detail-list__row">
                  <dt>Event date</dt>
                  <dd>{formatDate(openItem.eventDate)}</dd>
                </div>
                <div className="detail-list__row">
                  <dt>Location</dt>
                  <dd>{openItem.eventLocation}</dd>
                </div>
              </dl>
            ) : null}

            {openItem.attachments?.length ? (
              <>
                <h4>Attachments</h4>
                <ul className="icon-list">
                  {openItem.attachments.map((file) => (
                    <li className="icon-list__item" key={file.name}>
                      <span className="icon-list__bullet">
                        <Icon name="AttachFile" fontSize="inherit" />
                      </span>
                      {file.name} <span className="u-subtle">({file.size})</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </>
  );
}

export default AnnouncementsBoard;
