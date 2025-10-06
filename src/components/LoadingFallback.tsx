import React from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface LoadingFallbackProps {
  type?: 'page' | 'card' | 'minimal';
  message?: string;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  type = 'minimal',
  message = 'Loading...'
}) => {
  if (type === 'minimal') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-shield-pulse mb-4">
            <Shield className="h-12 w-12 text-primary mx-auto" />
          </div>
          <p className="text-muted-foreground">{message}</p>
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-card">
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Full page loader
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-shield-pulse mb-6">
          <Shield className="h-16 w-16 text-primary mx-auto" />
        </div>
        <div className="flex items-center gap-2 justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingFallback;
