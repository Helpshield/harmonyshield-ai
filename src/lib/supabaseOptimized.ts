import { supabase } from '@/integrations/supabase/client';

// Connection pooling and optimization for Supabase
class SupabaseConnectionPool {
  private static instance: SupabaseConnectionPool;
  private connectionQueue: Array<() => void> = [];
  private activeConnections = 0;
  private readonly maxConnections = 10; // Limit concurrent connections
  private readonly connectionTimeout = 30000; // 30 seconds
  
  private constructor() {}
  
  static getInstance(): SupabaseConnectionPool {
    if (!SupabaseConnectionPool.instance) {
      SupabaseConnectionPool.instance = new SupabaseConnectionPool();
    }
    return SupabaseConnectionPool.instance;
  }
  
  async executeQuery<T>(queryFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const executeWithConnection = async () => {
        if (this.activeConnections >= this.maxConnections) {
          // Queue the request
          this.connectionQueue.push(() => executeWithConnection());
          return;
        }
        
        this.activeConnections++;
        
        try {
          const timeout = new Promise((_, timeoutReject) => {
            setTimeout(() => timeoutReject(new Error('Query timeout')), this.connectionTimeout);
          });
          
          const result = await Promise.race([queryFn(), timeout]) as T;
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.activeConnections--;
          
          // Process next queued request
          const nextRequest = this.connectionQueue.shift();
          if (nextRequest) {
            setTimeout(nextRequest, 0);
          }
        }
      };
      
      executeWithConnection();
    });
  }
  
  getConnectionStats() {
    return {
      active: this.activeConnections,
      queued: this.connectionQueue.length,
      maxConnections: this.maxConnections
    };
  }
}

// Optimized query builders with connection pooling
export const optimizedSupabase = {
  // Connection pool instance
  pool: SupabaseConnectionPool.getInstance(),
  
  // Simplified optimized queries that avoid TypeScript conflicts
  async executeSelect(queryFn: () => any): Promise<any> {
    return this.pool.executeQuery(queryFn);
  },
  
  async executeInsert(queryFn: () => any): Promise<any> {
    return this.pool.executeQuery(queryFn);
  },
  
  async executeUpdate(queryFn: () => any): Promise<any> {
    return this.pool.executeQuery(queryFn);
  },
  
  async executeDelete(queryFn: () => any): Promise<any> {
    return this.pool.executeQuery(queryFn);
  },
  
  // Batch operations helper (use with specific table queries)
  async batchExecute<T>(
    operations: (() => Promise<{ data: T[] | null; error: any }>)[],
    batchSize: number = 5
  ): Promise<{ data: T[] | null; error: any }> {
    const results: T[] = [];
    const errors: any[] = [];
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      
      try {
        const batchResults = await Promise.all(
          batch.map(op => this.executeSelect(op))
        );
        
        batchResults.forEach(result => {
          if (result.data) {
            results.push(...result.data);
          }
          if (result.error) {
            errors.push(result.error);
          }
        });
      } catch (error) {
        errors.push(error);
      }
    }
    
    return {
      data: results.length > 0 ? results : null,
      error: errors.length > 0 ? errors : null
    };
  },
  
  // Cached queries for frequently accessed data
  async cachedQuery<T>(
    queryFn: () => Promise<{ data: T[] | null; error: any }>,
    cacheKey: string,
    cacheTTL: number = 5 * 60 * 1000 // 5 minutes
  ): Promise<{ data: T[] | null; error: any }> {
    const cache = new Map();
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      return cached.data;
    }
    
    const result = await this.executeSelect(queryFn);
    
    if (result.data) {
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
    }
    
    return result;
  },
  
  // Real-time subscription with automatic cleanup
  subscribeToTable(
    table: string,
    callback: (payload: any) => void,
    filters: Record<string, any> = {}
  ) {
    const channel = supabase.channel(`${table}_changes`);
    
    let subscription = channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter: Object.entries(filters).map(([key, value]) => `${key}=eq.${value}`).join(',')
      },
      callback
    );
    
    subscription.subscribe();
    
    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  },
  
  // Connection stats for monitoring
  getStats() {
    return this.pool.getConnectionStats();
  }
};

// Query optimization helpers
export const queryOptimizations = {
  // Build optimized pagination query
  buildPaginatedQuery: (
    baseQuery: any,
    page: number,
    pageSize: number,
    orderBy?: { column: string; ascending?: boolean }
  ) => {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    
    let query = baseQuery;
    
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
    }
    
    return query.range(from, to);
  },
  
  // Build search query with multiple fields
  buildSearchQuery: (
    baseQuery: any,
    searchTerm: string,
    searchFields: string[]
  ) => {
    if (!searchTerm.trim()) return baseQuery;
    
    return baseQuery.or(
      searchFields.map(field => `${field}.ilike.%${searchTerm}%`).join(',')
    );
  },
  
  // Build filter query from object
  buildFilterQuery: (
    baseQuery: any,
    filters: Record<string, any>
  ) => {
    let query = baseQuery;
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (typeof value === 'string' && value.includes('%')) {
          query = query.ilike(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    });
    
    return query;
  }
};