'use client';

import { useCallback, useMemo, useState } from 'react';

/**
 * Small controller for the filter bars used on the listing pages.
 *
 * Keeps the filter values, resets pagination whenever a filter changes and
 * reports how many non-default filters are currently applied.
 *
 * @param {Record<string, any>} initial
 */
export function useFilters(initial = {}) {
  const [filters, setFilters] = useState(initial);
  const [page, setPage] = useState(1);

  const setFilter = useCallback((key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initial);
    setPage(1);
    // `initial` is a literal supplied at the call site and never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeCount = useMemo(
    () =>
      Object.entries(filters).filter(([key, value]) => {
        const base = initial[key];
        return value !== base && value !== '' && value !== 'all' && value !== null;
      }).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters],
  );

  return { filters, setFilter, resetFilters, activeCount, page, setPage };
}

export default useFilters;
