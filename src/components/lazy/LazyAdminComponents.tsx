import React, { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield } from 'lucide-react';

// Loading fallback component
const LoadingFallback = ({ text = "Loading..." }: { text?: string }) => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="animate-shield-pulse">
        <Shield className="h-12 w-12 text-primary mx-auto" />
      </div>
      <p className="text-muted-foreground">{text}</p>
    </div>
  </div>
);

// Detailed loading component for admin pages
const AdminLoadingFallback = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="mb-8">
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-96" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

// Lazy load admin components with proper error boundaries
export const LazyAdminDashboard = React.lazy(() => 
  import('@/components/AdminDashboard').catch(error => {
    console.error('Failed to load AdminDashboard:', error);
    return { default: () => <div>Failed to load admin dashboard</div> };
  })
);

export const LazyAdminUsersManagement = React.lazy(() => 
  import('@/components/AdminUsersManagement').catch(error => {
    console.error('Failed to load AdminUsersManagement:', error);
    return { default: () => <div>Failed to load users management</div> };
  })
);

export const LazyAdminReportsManagement = React.lazy(() => 
  import('@/components/AdminReportsManagement').catch(error => {
    console.error('Failed to load AdminReportsManagement:', error);
    return { default: () => <div>Failed to load reports management</div> };
  })
);

export const LazyAdminBotManagement = React.lazy(() => 
  import('@/components/AdminBotManagement').catch(error => {
    console.error('Failed to load AdminBotManagement:', error);
    return { default: () => <div>Failed to load bot management</div> };
  })
);

export const LazyAdminThreatsPage = React.lazy(() => 
  import('@/components/AdminThreatsPage').catch(error => {
    console.error('Failed to load AdminThreatsPage:', error);
    return { default: () => <div>Failed to load threats page</div> };
  })
);

export const LazyAdminRecoveryJobsPage = React.lazy(() => 
  import('@/components/AdminRecoveryJobsPage').catch(error => {
    console.error('Failed to load AdminRecoveryJobsPage:', error);
    return { default: () => <div>Failed to load recovery jobs</div> };
  })
);

export const LazyAdminAnalyticsPage = React.lazy(() => 
  import('@/components/AdminAnalyticsPage').catch(error => {
    console.error('Failed to load AdminAnalyticsPage:', error);
    return { default: () => <div>Failed to load analytics page</div> };
  })
);

export const LazyAdminABTestingPage = React.lazy(() => 
  import('@/components/AdminABTestingPage').catch(error => {
    console.error('Failed to load AdminABTestingPage:', error);
    return { default: () => <div>Failed to load A/B testing page</div> };
  })
);

export const LazyAdminContentManagement = React.lazy(() => 
  import('@/components/AdminContentManagement').catch(error => {
    console.error('Failed to load AdminContentManagement:', error);
    return { default: () => <div>Failed to load content management</div> };
  })
);

export const LazyAdminSystemMonitoring = React.lazy(() => 
  import('@/components/AdminSystemMonitoring').catch(error => {
    console.error('Failed to load AdminSystemMonitoring:', error);
    return { default: () => <div>Failed to load system monitoring</div> };
  })
);

export const LazyAdminSecurityCenter = React.lazy(() => 
  import('@/components/AdminSecurityCenter').catch(error => {
    console.error('Failed to load AdminSecurityCenter:', error);
    return { default: () => <div>Failed to load security center</div> };
  })
);

// HOC for wrapping lazy components with suspense and error boundary
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  loadingText?: string
) => {
  return (props: P) => (
    <Suspense fallback={<AdminLoadingFallback />}>
      <Component {...props} />
    </Suspense>
  );
};

// Simple loading wrapper for non-admin components
export const withSimpleLoading = <P extends object>(
  Component: React.ComponentType<P>,
  loadingText?: string
) => {
  return (props: P) => (
    <Suspense fallback={<LoadingFallback text={loadingText} />}>
      <Component {...props} />
    </Suspense>
  );
};