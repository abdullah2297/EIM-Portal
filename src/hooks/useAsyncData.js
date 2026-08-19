'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs an async loader and exposes the four states every list screen needs:
 * loading, error, empty and loaded.
 *
 * Stale responses are discarded, so rapid filter changes can never render an
 * out-of-date result set.
 *
 * @template T
 * @param {() => Promise<T>} loader
 * @param {any[]} deps
 * @param {{ initialData?: T, enabled?: boolean }} [options]
 */
export function useAsyncData(loader, deps = [], options = {}) {
  const { initialData = null, enabled = true } = options;

  const [data, setData] = useState(initialData);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const requestId = useRef(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const run = useCallback(async () => {
    const current = requestId.current + 1;
    requestId.current = current;

    setIsLoading(true);
    setError(null);

    try {
      const result = await loaderRef.current();
      if (requestId.current === current) setData(result);
    } catch (err) {
      if (requestId.current === current) {
        setError(err instanceof Error ? err : new Error('Something went wrong.'));
      }
    } finally {
      if (requestId.current === current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    run();
    // The caller declares its own dependency list, mirroring useEffect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  return { data, error, isLoading, refetch: run, setData };
}

export default useAsyncData;
