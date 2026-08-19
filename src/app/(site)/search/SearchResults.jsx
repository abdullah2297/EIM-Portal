'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { searchService } from '@/services';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { SearchInput, ChipFilters } from '@/components/ui/Fields';
import { DataState, EmptyState } from '@/components/ui/StateViews';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { ROUTES } from '@/lib/constants';

const ALL = 'all';

/**
 * Global search across employees, teams, sub-teams, initiatives, achievements,
 * announcements, success stories and competitions. Results are grouped by
 * content type; the query is kept in the URL so results are shareable.
 */
export function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTerm = searchParams.get('q') ?? '';

  const [term, setTerm] = useState(initialTerm);
  const [group, setGroup] = useState(ALL);
  const debouncedTerm = useDebouncedValue(term, 350);

  // Keep the address bar in sync so results can be shared or bookmarked.
  useEffect(() => {
    const next = debouncedTerm.trim();
    const current = searchParams.get('q') ?? '';
    if (next === current) return;
    router.replace(next ? `${ROUTES.search}?q=${encodeURIComponent(next)}` : ROUTES.search, {
      scroll: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTerm]);

  const { data, error, isLoading, refetch } = useAsyncData(
    () => searchService.search(debouncedTerm, 8),
    [debouncedTerm],
    { enabled: debouncedTerm.trim().length >= 2 },
  );

  const groups = data?.groups ?? [];
  const total = data?.total ?? 0;
  const visibleGroups = group === ALL ? groups : groups.filter((item) => item.key === group);
  const hasQuery = debouncedTerm.trim().length >= 2;

  return (
    <section className="section">
      <div className="container-page u-stack u-stack--lg">
        <div className="filter-bar">
          <SearchInput
            value={term}
            onChange={setTerm}
            placeholder="Search people, teams, initiatives, news, competitions..."
            label="Search the portal"
            className="form-grid__full"
          />
          <div className="filter-bar__footer">
            <ChipFilters
              options={[
                { value: ALL, label: 'Everything', count: total },
                ...groups.map((item) => ({ value: item.key, label: item.label, count: item.count })),
              ]}
              value={group}
              onChange={setGroup}
              ariaLabel="Filter results by content type"
            />
            {hasQuery ? (
              <span>
                <strong>{total}</strong> result(s) for "{debouncedTerm.trim()}"
              </span>
            ) : null}
          </div>
        </div>

        {!hasQuery ? (
          <EmptyState
            icon="Search"
            title="Start typing to search"
            message="Enter at least two characters to search across every section of the portal."
          />
        ) : (
          <DataState
            isLoading={isLoading}
            error={error}
            isEmpty={visibleGroups.length === 0}
            onRetry={refetch}
            skeletonCount={4}
            skeletonClassName="grid-auto grid-auto--2"
            emptyProps={{
              icon: 'SearchOff',
              title: 'No matches found',
              message: 'Try a shorter or more general term - for example a first name, a team name or a topic.',
            }}
          >
            <div className="u-stack u-stack--lg">
              {visibleGroups.map((resultGroup) => (
                <section key={resultGroup.key} className="u-stack">
                  <SectionHeading
                    eyebrow={`${resultGroup.count} result(s)`}
                    eyebrowIcon={resultGroup.icon}
                    title={resultGroup.label}
                    as="h2"
                  />
                  <div className="grid-auto grid-auto--2">
                    {resultGroup.results.map((result) => (
                      <Link key={`${resultGroup.key}-${result.id}`} href={result.href} className="card card--interactive">
                        <div className="card__body">
                          <div className="u-cluster u-cluster--sm">
                            <Badge tone="primary" icon={resultGroup.icon}>
                              {resultGroup.label}
                            </Badge>
                            {result.subtitle ? <span className="u-text-xs u-subtle">{result.subtitle}</span> : null}
                          </div>
                          <h3 className="card__title">{result.title}</h3>
                          {result.excerpt ? <p className="card__text">{result.excerpt}</p> : null}
                          <span className="u-cluster u-cluster--sm u-text-xs u-brand">
                            Open
                            <Icon name="ChevronRight" fontSize="inherit" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </DataState>
        )}
      </div>
    </section>
  );
}

export default SearchResults;
