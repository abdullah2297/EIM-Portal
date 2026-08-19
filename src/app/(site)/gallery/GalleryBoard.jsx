'use client';

import { useMemo, useState } from 'react';
import { galleryService } from '@/services';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useFilters } from '@/hooks/useFilters';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ChipFilters, SelectField } from '@/components/ui/Fields';
import { DataState } from '@/components/ui/StateViews';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Overlays';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';
import { GalleryCard } from '@/components/cards/GalleryCard';
import { GALLERY_CATEGORIES, PAGE_SIZE } from '@/lib/constants';
import { formatDate } from '@/lib/format';

const ALL = 'all';
const INITIAL_FILTERS = { category: ALL, event: ALL };

/** Photo gallery with category and event filters plus a lightbox. */
export function GalleryBoard() {
  const { filters, setFilter, resetFilters, activeCount, page, setPage } = useFilters(INITIAL_FILTERS);
  const [openItem, setOpenItem] = useState(null);

  const { data: allData } = useAsyncData(() => galleryService.list(), []);
  const all = useMemo(() => allData?.items ?? [], [allData]);
  const events = useMemo(() => [...new Set(all.map((item) => item.event).filter(Boolean))], [all]);
  const featured = all.slice(0, 4);

  const { data, error, isLoading, refetch } = useAsyncData(
    () =>
      galleryService.list({
        category: filters.category,
        event: filters.event,
        sort: 'date',
        order: 'desc',
        page,
        pageSize: PAGE_SIZE.gallery,
      }),
    [filters.category, filters.event, page],
  );

  const items = data?.items ?? [];
  const meta = data?.meta ?? null;

  return (
    <>
      {/* 1. Featured photos ---------------------------------------------------- */}
      <section className="section section--tight">
        <div className="container-page u-stack u-stack--lg">
          <SectionHeading
            eyebrow="Highlights"
            eyebrowIcon="PhotoLibrary"
            title="Featured photos"
            subtitle="A snapshot of life in the department."
          />
          <div className="gallery-grid">
            {featured.map((item, index) => (
              <GalleryCard key={item.id} item={item} wide={index === 0} onOpen={setOpenItem} />
            ))}
          </div>
        </div>
      </section>

      {/* 2-6. Filters and the full grid ---------------------------------------- */}
      <section className="section section--muted">
        <div className="container-page u-stack u-stack--lg">
          <SectionHeading
            eyebrow="Browse"
            eyebrowIcon="Search"
            title="All photos"
            subtitle="Filter by category or by event."
          />

          <ChipFilters
            options={[
              { value: ALL, label: 'All categories' },
              ...GALLERY_CATEGORIES.map((item) => ({
                value: item,
                label: item,
                count: all.filter((photo) => photo.category === item).length,
              })),
            ]}
            value={filters.category}
            onChange={(value) => setFilter('category', value)}
            ariaLabel="Filter photos by category"
          />

          <div className="filter-bar">
            <SelectField
              label="Event"
              name="event"
              value={filters.event}
              onChange={setFilter}
              options={[
                { value: ALL, label: 'All events' },
                ...events.map((event) => ({ value: event, label: event })),
              ]}
              className="form-grid__full"
            />
            <div className="filter-bar__footer">
              <span>{meta ? <><strong>{meta.total}</strong> photo(s)</> : 'Loading...'}</span>
              {activeCount ? (
                <Button variant="ghost" size="sm" icon="Cancel" onClick={resetFilters}>
                  Reset filters
                </Button>
              ) : null}
            </div>
          </div>

          <DataState
            isLoading={isLoading}
            error={error}
            isEmpty={items.length === 0}
            onRetry={refetch}
            skeletonCount={8}
            skeletonClassName="gallery-grid"
            emptyProps={{
              icon: 'PhotoLibrary',
              title: 'No photos here yet',
              message: 'Photos added through the admin panel will appear in this gallery.',
              actionLabel: 'Reset filters',
              onAction: resetFilters,
            }}
          >
            <div className="gallery-grid">
              {items.map((item, index) => (
                <GalleryCard key={item.id} item={item} wide={index % 7 === 0} onOpen={setOpenItem} />
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

      {/* Lightbox --------------------------------------------------------------- */}
      <Modal
        open={Boolean(openItem)}
        onClose={() => setOpenItem(null)}
        title={openItem?.title ?? ''}
        maxWidth="md"
        actions={<Button variant="outline" onClick={() => setOpenItem(null)}>Close</Button>}
      >
        {openItem ? (
          <div className="u-stack">
            <div className="card__media">
              <MediaPlaceholder src={openItem.image} alt={openItem.title} icon="PhotoLibrary" variant="brand" />
            </div>
            <div className="u-cluster u-cluster--sm">
              <Badge tone="primary">{openItem.category}</Badge>
              <Badge tone="neutral">{openItem.event}</Badge>
              <span className="u-text-xs u-subtle">{formatDate(openItem.date)}</span>
            </div>
            <p className="u-muted">{openItem.caption}</p>
          </div>
        ) : null}
      </Modal>
    </>
  );
}

export default GalleryBoard;
