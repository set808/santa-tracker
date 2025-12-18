/**
 * Custom React hook for querying New Relic data via NerdGraph proxy
 *
 * This hook fetches data from the nerdgraph-proxy service and handles
 * automatic polling, error handling, and loading states.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { NRQLQueryConfig, UseNRQLQueryState, NRQLError } from '../types/new-relic';

interface UseNewRelicQueryOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

const NERDGRAPH_PROXY_URL = import.meta.env.VITE_NERDGRAPH_PROXY_URL || 'http://localhost:3007';

/**
 * Hook for fetching data from New Relic via the NerdGraph proxy
 *
 * @param queryConfig - NRQL query configuration
 * @param options - Hook options (enabled, refetchInterval)
 * @returns Query state with data, loading, error, and refetch function
 */
export function useNewRelicQuery<T = unknown>(
  queryConfig: NRQLQueryConfig,
  options: UseNewRelicQueryOptions = {}
): UseNRQLQueryState<T> {
  const { enabled = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<NRQLError | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch data from the nerdgraph-proxy
   */
  const fetchData = useCallback(async () => {
    if (!enabled) {
      return;
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${NERDGRAPH_PROXY_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nrql: queryConfig.query,
          accountId: queryConfig.accountId,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Query failed');
      }

      setData(result.data as T);
      setError(null);
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';

      setError({
        message: errorMessage,
        code: 'FETCH_ERROR',
        details: { query: queryConfig.query },
      });

      console.error('New Relic query error:', errorMessage, {
        query: queryConfig.query,
        description: queryConfig.description,
      });
    } finally {
      setLoading(false);
    }
  }, [queryConfig.query, queryConfig.accountId, queryConfig.description, enabled]);

  /**
   * Refetch function that can be called manually
   */
  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  /**
   * Effect to handle initial fetch and polling
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Initial fetch
    fetchData();

    // DISABLED: Auto-polling to prevent 429 rate limit errors
    // Only manual refresh via refetch() is supported now
    // const interval = refetchInterval || queryConfig.refreshInterval;
    // if (interval && interval > 0) {
    //   intervalRef.current = setInterval(() => {
    //     fetchData();
    //   }, interval);
    // }

    // Cleanup function
    return () => {
      // Clear polling interval (if we re-enable it)
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Abort any in-flight requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [enabled, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

export default useNewRelicQuery;
