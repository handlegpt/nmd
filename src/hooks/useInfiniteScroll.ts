import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollProps<T> {
  fetchFunction: (page: number, limit: number) => Promise<T[]>;
  limit?: number;
  initialPage?: number;
}

interface UseInfiniteScrollReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  page: number;
}

export function useInfiniteScroll<T>({
  fetchFunction,
  limit = 20,
  initialPage = 0
}: UseInfiniteScrollProps<T>): UseInfiniteScrollReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(initialPage);

  const loadData = useCallback(async (pageNum: number, reset: boolean = false) => {
    if (loading && !reset) return;
    
    setLoading(true);
    setError(null);

    try {
      const offset = pageNum * limit;
      const newData = await fetchFunction(pageNum, limit);
      
      if (reset) {
        setData(newData);
      } else {
        setData(prev => [...prev, ...newData]);
      }

      // Check if we have more data
      setHasMore(newData.length === limit);
      
      if (!reset) {
        setPage(pageNum);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, limit, loading]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await loadData(page + 1);
  }, [hasMore, loading, page, loadData]);

  const refresh = useCallback(async () => {
    setPage(initialPage);
    setHasMore(true);
    await loadData(initialPage, true);
  }, [initialPage, loadData]);

  // Load initial data
  useEffect(() => {
    loadData(initialPage, true);
  }, []);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    page
  };
}
