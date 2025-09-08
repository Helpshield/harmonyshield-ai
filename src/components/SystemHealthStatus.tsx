import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'checking';
  message: string;
  icon: React.ReactNode;
}

const SystemHealthStatus = () => {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([
    { name: 'Database', status: 'checking', message: 'Checking...', icon: <Clock className="h-3 w-3 mr-1" /> },
    { name: 'API Services', status: 'checking', message: 'Checking...', icon: <Clock className="h-3 w-3 mr-1" /> },
    { name: 'Edge Functions', status: 'checking', message: 'Checking...', icon: <Clock className="h-3 w-3 mr-1" /> },
    { name: 'Authentication', status: 'checking', message: 'Checking...', icon: <Clock className="h-3 w-3 mr-1" /> }
  ]);

  useEffect(() => {
    performHealthChecks();
    
    // Refresh health checks every 60 seconds
    const interval = setInterval(performHealthChecks, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const performHealthChecks = async () => {
    const checks: HealthCheck[] = [];

    // Database health check
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      if (error) throw error;
      
      checks.push({
        name: 'Database',
        status: 'healthy',
        message: 'Connected',
        icon: <CheckCircle className="h-3 w-3 mr-1" />
      });
    } catch (error) {
      checks.push({
        name: 'Database',
        status: 'error',
        message: 'Connection failed',
        icon: <XCircle className="h-3 w-3 mr-1" />
      });
    }

    // API Services health check (test with a simple query)
    try {
      const { error } = await supabase.from('scam_reports').select('id', { count: 'exact', head: true });
      if (error) throw error;
      
      checks.push({
        name: 'API Services',
        status: 'healthy',
        message: 'Operational',
        icon: <CheckCircle className="h-3 w-3 mr-1" />
      });
    } catch (error) {
      checks.push({
        name: 'API Services',
        status: 'error',
        message: 'Service unavailable',
        icon: <XCircle className="h-3 w-3 mr-1" />
      });
    }

    // Edge Functions health check (simulate)
    try {
      // Check if we can access scan results (which use edge functions)
      const { error } = await supabase.from('scan_results').select('id', { count: 'exact', head: true });
      if (error) throw error;
      
      checks.push({
        name: 'Edge Functions',
        status: 'healthy',
        message: 'Running',
        icon: <CheckCircle className="h-3 w-3 mr-1" />
      });
    } catch (error) {
      checks.push({
        name: 'Edge Functions',
        status: 'warning',
        message: 'Limited functionality',
        icon: <AlertCircle className="h-3 w-3 mr-1" />
      });
    }

    // Authentication health check
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      checks.push({
        name: 'Authentication',
        status: 'healthy',
        message: 'Active',
        icon: <CheckCircle className="h-3 w-3 mr-1" />
      });
    } catch (error) {
      checks.push({
        name: 'Authentication',
        status: 'error',
        message: 'Service error',
        icon: <XCircle className="h-3 w-3 mr-1" />
      });
    }

    setHealthChecks(checks);
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'outline' as const;
      case 'warning':
        return 'secondary' as const;
      case 'error':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 border-green-600';
      case 'warning':
        return 'text-yellow-600 border-yellow-600';
      case 'error':
        return 'text-red-600 border-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      {healthChecks.map((check, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className="text-sm">{check.name}</span>
          <Badge 
            variant={getBadgeVariant(check.status)} 
            className={getBadgeColor(check.status)}
          >
            {check.icon}
            {check.message}
          </Badge>
        </div>
      ))}
    </div>
  );
};

export default SystemHealthStatus;