import React, { forwardRef, useCallback, useMemo, useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export interface VirtualListItem {
  id: string;
  [key: string]: any;
}

interface VirtualListProps {
  items: VirtualListItem[];
  hasNextPage: boolean;
  isNextPageLoading: boolean;
  loadNextPage: () => Promise<void>;
  renderItem: (item: VirtualListItem, index: number) => React.ReactNode;
  itemHeight?: number;
  height?: number;
  className?: string;
  emptyStateComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

// Default loading skeleton for list items
const DefaultLoadingItem = () => (
  <div className="p-4 border-b">
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </CardContent>
    </Card>
  </div>
);

// Default empty state component
const DefaultEmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="text-muted-foreground mb-4">
      <svg
        className="h-16 w-16 mx-auto mb-4 opacity-50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium mb-2">No items found</h3>
    <p className="text-sm text-muted-foreground max-w-sm">
      There are no items to display at the moment. Try adjusting your filters or check back later.
    </p>
  </div>
);

// Simplified virtual list with infinite scrolling
export const VirtualList = forwardRef<HTMLDivElement, VirtualListProps>(({
  items,
  hasNextPage,
  isNextPageLoading,
  loadNextPage,
  renderItem,
  itemHeight = 100,
  height = 600,
  className = '',
  emptyStateComponent = <DefaultEmptyState />,
  loadingComponent = <DefaultLoadingItem />,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle infinite scroll
  const handleScroll = useCallback(async () => {
    if (!containerRef.current || isLoading || !hasNextPage) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    
    // Load more when scrolled to 80% of the content
    if (scrollTop + clientHeight >= scrollHeight * 0.8) {
      setIsLoading(true);
      try {
        await loadNextPage();
      } finally {
        setIsLoading(false);
      }
    }
  }, [hasNextPage, isLoading, loadNextPage]);

  // Attach scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Show empty state if no items and not loading
  if (items.length === 0 && !isNextPageLoading) {
    return (
      <div className={`w-full ${className}`}>
        {emptyStateComponent}
      </div>
    );
  }

  return (
    <div 
      ref={(node) => {
        if (containerRef) containerRef.current = node;
        if (ref) {
          if (typeof ref === 'function') {
            ref(node);
          } else {
            ref.current = node;
          }
        }
      }}
      className={`w-full overflow-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-background ${className}`}
      style={{ height }}
    >
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={item.id} className="min-h-[100px]">
            {renderItem(item, index)}
          </div>
        ))}
        
        {/* Loading indicators */}
        {(isNextPageLoading || isLoading) && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`loading-${i}`}>
                {loadingComponent}
              </div>
            ))}
          </div>
        )}
        
        {/* End of list indicator */}
        {!hasNextPage && items.length > 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No more items to load
          </div>
        )}
      </div>
    </div>
  );
});

VirtualList.displayName = 'VirtualList';

// Hook for managing virtual list data with pagination
export const useVirtualListData = <T extends VirtualListItem>(
  fetchPage: (page: number, pageSize: number) => Promise<{ data: T[]; hasMore: boolean }>,
  pageSize: number = 50
) => {
  const [items, setItems] = React.useState<T[]>([]);
  const [hasNextPage, setHasNextPage] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(0);

  const loadNextPage = useCallback(async () => {
    if (isLoading || !hasNextPage) return;

    setIsLoading(true);
    try {
      const result = await fetchPage(currentPage, pageSize);
      
      setItems(prevItems => [...prevItems, ...result.data]);
      setHasNextPage(result.hasMore);
      setCurrentPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading next page:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, isLoading, hasNextPage, fetchPage]);

  const reset = useCallback(() => {
    setItems([]);
    setCurrentPage(0);
    setHasNextPage(true);
    setIsLoading(false);
  }, []);

  return {
    items,
    hasNextPage,
    isNextPageLoading: isLoading,
    loadNextPage,
    reset,
  };
};

// Performance-optimized list item wrapper
export const ListItem = React.memo<{
  children: React.ReactNode;
  className?: string;
}>(({ children, className = '' }) => {
  return (
    <Card className={`mb-2 hover-lift shadow-card ${className}`}>
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  );
});

ListItem.displayName = 'ListItem';