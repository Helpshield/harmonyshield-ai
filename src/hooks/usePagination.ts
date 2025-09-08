import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PaginationOptions {
  pageSize?: number;
  initialPage?: number;
}

interface PaginatedResult<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isLoading: boolean;
  error: string | null;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  refresh: () => void;
}

export function usePagination<T = any>(
  tableName: string,
  options: PaginationOptions = {},
  filters: Record<string, any> = {},
  select: string = '*',
  orderBy: { column: string; ascending?: boolean } = { column: 'created_at', ascending: false }
): PaginatedResult<T> {
  const { pageSize = 10, initialPage = 1 } = options;
  
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [data, setData] = useState<T[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      // Build query with filters
      let query = supabase
        .from(tableName as any)
        .select(select, { count: 'exact' });

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'string' && value.includes('%')) {
            query = query.ilike(key, value);
          } else {
            query = query.eq(key, value);
          }
        }
      });

      // Apply ordering
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });

      // Apply pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data: result, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      setData((result as T[]) || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Pagination fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setData([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, JSON.stringify(filters), tableName, select, JSON.stringify(orderBy)]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const previousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const refresh = () => {
    fetchData();
  };

  return {
    data,
    currentPage,
    totalPages,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    error,
    goToPage,
    nextPage,
    previousPage,
    refresh
  };
}

// Hook for user-specific data with automatic user filtering
export function useUserPagination<T = any>(
  tableName: string,
  options: PaginationOptions = {},
  additionalFilters: Record<string, any> = {},
  select: string = '*',
  orderBy: { column: string; ascending?: boolean } = { column: 'created_at', ascending: false }
): PaginatedResult<T> {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getUserId();
  }, []);

  const filters = useMemo(() => ({
    user_id: userId,
    ...additionalFilters
  }), [userId, additionalFilters]);

  return usePagination<T>(tableName, options, filters, select, orderBy);
}