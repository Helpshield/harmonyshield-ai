import { QueryClient } from '@tanstack/react-query';

// Enhanced React Query configuration for optimal performance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - data stays fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache time - data stays in cache for 10 minutes after becoming unused
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus only for critical data
      refetchOnWindowFocus: false,
      // Background refetch interval for real-time-ish updates
      refetchInterval: 5 * 60 * 1000, // 5 minutes
      // Only refetch when data is stale
      refetchOnMount: true,
      // Network mode configuration
      networkMode: 'online',
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      // Network mode for mutations
      networkMode: 'online',
    },
  },
});

// Prefetch critical data
export const prefetchCriticalData = async (userId: string) => {
  if (!userId) return;

  const prefetchQueries = [
    // Prefetch user profile
    queryClient.prefetchQuery({
      queryKey: ['profile', userId],
      queryFn: async () => {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        return data;
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
    }),

    // Prefetch user role
    queryClient.prefetchQuery({
      queryKey: ['userRole', userId],
      queryFn: async () => {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single();
        return data?.role || 'user';
      },
      staleTime: 15 * 60 * 1000, // 15 minutes
    }),

    // Prefetch recent notifications
    queryClient.prefetchQuery({
      queryKey: ['notifications', userId],
      queryFn: async () => {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .eq('read', false)
          .order('created_at', { ascending: false })
          .limit(5);
        return data || [];
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
    }),
  ];

  await Promise.allSettled(prefetchQueries);
};

// Background sync for offline support
export const setupBackgroundSync = () => {
  // Register service worker message listener for background sync
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'SYNC_DATA') {
        // Invalidate and refetch critical queries
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
    });
  }

  // Setup periodic background updates when app is visible
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      // Refetch critical data when app becomes visible
      queryClient.refetchQueries({ 
        queryKey: ['notifications'],
        type: 'active' 
      });
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};