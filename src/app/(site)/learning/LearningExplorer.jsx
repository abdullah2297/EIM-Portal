'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { trainingCategoriesService, trainingTypesService, trainingsService } from '@/services';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { SearchInput, ChipFilters, SelectField } from '@/components/ui/Fields';
import { DataState, EmptyState } from '@/components/ui/StateViews';
import { StatTile } from '@/components/ui/StatTile';
import { TrainingCard } from '@/components/cards/TrainingCard';
import { DELIVERY_METHODS, PUBLIC_TRAINING_STATUS, TRAINING_LEVELS } from '@/lib/constants';

const ALL = 'all';

/** Section groupings the catalog is organised into, in display order. */
const STATUS_SECTIONS = [
  { status: 'Registration Open', title: 'Available for registration', eyebrow: 'Open now', icon: 'HowToReg' },
  { status: 'Ongoing', title: 'Ongoing training', eyebrow: 'Happening now', icon: 'Bolt' },
  { status: 'Published', title: 'Upcoming training', eyebrow: 'Coming soon', icon: 'Schedule' },
  { status: 'Registration Closed', title: 'Registration closed', eyebrow: 'Almost full', icon: 'Cancel' },
  { status: 'Completed', title: 'Completed training', eyebrow: 'Archive', icon: 'Timeline' },
];

/**
 * Training catalog: search, type/category/level/delivery filters, and the
 * results grouped into the statuses the admin panel drives (mirrors the
 * client-side status buckets already used by `CompetitionsBoard`).
 */
export function LearningExplorer() {
  const searchParams = useSearchParams();

  const [term, setTerm] = useState('');
  const [typeId, setTypeId] = useState(ALL);
  const [categoryId, setCategoryId] = useState(searchParams.get('category') ?? ALL);
  const [level, setLevel] = useState(ALL);
  const [deliveryMethod, setDeliveryMethod] = useState(ALL);
  const debouncedTerm = useDebouncedValue(term, 250);

  const { data, error, isLoading, refetch } = useAsyncData(
    () =>
      Promise.all([
        trainingsService.list({ q: debouncedTerm, pageSize: 200 }),
        trainingCategoriesService.list({ pageSize: 200 }),
        trainingTypesService.list({ pageSize: 200 }),
      ]),
    [debouncedTerm],
  );

  const categories = useMemo(() => data?.[1]?.items ?? [], [data]);
  const types = useMemo(() => data?.[2]?.items ?? [], [data]);
  const categoriesById = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);
  const typesById = useMemo(() => Object.fromEntries(types.map((t) => [t.id, t])), [types]);

  const trainings = useMemo(() => {
    const raw = data?.[0]?.items ?? [];
    return raw
      .filter((training) => PUBLIC_TRAINING_STATUS.includes(training.status))
      .map((training) => {
        const category = categoriesById[training.categoryId] ?? null;
        return { ...training, category, type: category ? typesById[category.trainingTypeId] ?? null : null };
      });
  }, [data, categoriesById, typesById]);

  const filtered = trainings.filter(
    (training) =>
      (typeId === ALL || training.type?.id === typeId) &&
      (categoryId === ALL || training.categoryId === categoryId) &&
      (level === ALL || training.level === level) &&
      (deliveryMethod === ALL || training.deliveryMethod === deliveryMethod),
  );

  const visibleCategories = typeId === ALL ? categories : categories.filter((c) => c.trainingTypeId === typeId);

  const renderGrid = (items, emptyProps) =>
    items.length ? (
      <div className="grid-auto">
        {items.map((training, index) => (
          <div key={training.id} className={`u-anim-in u-delay-${(index % 9) + 1}`}>
            <TrainingCard training={training} />
          </div>
        ))}
      </div>
    ) : (
      <EmptyState {...emptyProps} />
    );

  return (
    <>
      <section className="section section--tight">
        <div className="container-page u-stack u-stack--lg">
          <div className="grid-auto grid-auto--4">
            <StatTile value={filtered.length} label="Training courses" icon="MenuBook" />
            <StatTile
              value={filtered.filter((t) => t.status === 'Registration Open').length}
              label="Open for registration"
              icon="HowToReg"
            />
            <StatTile value={types.length} label="Training types" icon="School" />
            <StatTile value={categories.length} label="Categories" icon="Category" />
          </div>

          <div className="filter-bar">
            <SearchInput value={term} onChange={setTerm} placeholder="Search training, instructors..." />
            <div className="filter-bar__footer">
              <ChipFilters
                options={[{ value: ALL, label: 'All types' }, ...types.map((t) => ({ value: t.id, label: t.name }))]}
                value={typeId}
                onChange={(value) => {
                  setTypeId(value);
                  setCategoryId(ALL);
                }}
                ariaLabel="Filter by training type"
              />
            </div>
            <div className="filter-bar__footer">
              <ChipFilters
                options={[
                  { value: ALL, label: 'All categories' },
                  ...visibleCategories.map((c) => ({ value: c.id, label: c.name })),
                ]}
                value={categoryId}
                onChange={setCategoryId}
                ariaLabel="Filter by category"
              />
            </div>
            <div className="filter-bar__footer">
              <SelectField
                label="Level"
                name="level"
                value={level}
                onChange={(_, value) => setLevel(value)}
                options={[{ value: ALL, label: 'All levels' }, ...TRAINING_LEVELS.map((l) => ({ value: l, label: l }))]}
              />
              <SelectField
                label="Delivery method"
                name="deliveryMethod"
                value={deliveryMethod}
                onChange={(_, value) => setDeliveryMethod(value)}
                options={[
                  { value: ALL, label: 'All delivery methods' },
                  ...DELIVERY_METHODS.map((m) => ({ value: m, label: m })),
                ]}
              />
              <span>
                <strong>{filtered.length}</strong> course(s)
              </span>
            </div>
          </div>
        </div>
      </section>

      <DataState isLoading={isLoading} error={error} isEmpty={false} onRetry={refetch} skeletonCount={3}>
        {STATUS_SECTIONS.map((section, index) => (
          <section className={`section section--tight ${index % 2 ? 'section--muted' : ''}`.trim()} key={section.status}>
            <div className="container-page u-stack u-stack--lg">
              <SectionHeading eyebrow={section.eyebrow} eyebrowIcon={section.icon} title={section.title} />
              {renderGrid(
                filtered.filter((training) => training.status === section.status),
                {
                  icon: section.icon,
                  title: `No ${section.title.toLowerCase()} yet`,
                  message: 'Check back soon, or adjust your filters above.',
                },
              )}
            </div>
          </section>
        ))}
      </DataState>
    </>
  );
}

export default LearningExplorer;
