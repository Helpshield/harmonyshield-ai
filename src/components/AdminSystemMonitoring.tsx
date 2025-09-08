import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity,
  Server,
  Database,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from './AppLayout';

const AdminSystemMonitoring = () => {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    system: {
      cpu_usage: 45,
      memory_usage: 68,
      disk_usage: 32,
      network_in: 1.2,
      network_out: 0.8,
      uptime: '15d 4h 32m',
      last_updated: new Date().toISOString()
    },
    database: {
      connections: 23,
      max_connections: 100,
      query_performance: 'Good',
      slow_queries: 2,
      storage_used: 85,
      backup_status: 'Success',
      last_backup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    services: [
      { name: 'API Gateway', status: 'healthy', response_time: 120, uptime: 99.9 },
      { name: 'Authentication Service', status: 'healthy', response_time: 85, uptime: 99.8 },
      { name: 'URL Scanner', status: 'warning', response_time: 250, uptime: 98.5 },
      { name: 'Email Service', status: 'healthy', response_time: 95, uptime: 99.7 },
      { name: 'File Storage', status: 'healthy', response_time: 110, uptime: 99.9 },
      { name: 'Deep Search Engine', status: 'healthy', response_time: 180, uptime: 99.6 }
    ],
    performance: [
      { time: '00:00', cpu: 35, memory: 60, requests: 450 },
      { time: '04:00', cpu: 28, memory: 55, requests: 320 },
      { time: '08:00', cpu: 52, memory: 70, requests: 890 },
      { time: '12:00', cpu: 48, memory: 68, requests: 1200 },
      { time: '16:00', cpu: 55, memory: 72, requests: 1100 },
      { time: '20:00', cpu: 45, memory: 65, requests: 850 },
      { time: '24:00', cpu: 42, memory: 63, requests: 680 }
    ],
    alerts: [
      {
        id: 1,
        type: 'warning',
        title: 'High Response Time',
        message: 'URL Scanner service response time above threshold (250ms)',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        acknowledged: false
      },
      {
        id: 2,
        type: 'info',
        title: 'Scheduled Maintenance',
        message: 'Database backup completed successfully',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        acknowledged: true
      },
      {
        id: 3,
        type: 'success',
        title: 'Performance Improvement',
        message: 'Average API response time decreased by 15%',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        acknowledged: true
      }
    ]
  });

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      // Simulate loading real metrics
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update metrics with slight variations to simulate real-time data
      setMetrics(prev => ({
        ...prev,
        system: {
          ...prev.system,
          cpu_usage: Math.max(20, Math.min(80, prev.system.cpu_usage + (Math.random() - 0.5) * 10)),
          memory_usage: Math.max(40, Math.min(90, prev.system.memory_usage + (Math.random() - 0.5) * 8)),
          network_in: Math.max(0.5, Math.min(3, prev.system.network_in + (Math.random() - 0.5) * 0.5)),
          network_out: Math.max(0.3, Math.min(2, prev.system.network_out + (Math.random() - 0.5) * 0.3)),
          last_updated: new Date().toISOString()
        }
      }));
    } catch (error) {
      console.error('Error loading metrics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load system metrics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = (alertId: number) => {
    setMetrics(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    }));
    
    toast({
      title: 'Alert Acknowledged',
      description: 'Alert has been marked as acknowledged'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <AlertTriangle className="h-4 w-4 text-info" />;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              System Monitoring
            </h1>
            <p className="text-muted-foreground">
              Real-time system performance and health monitoring
            </p>
          </div>
          <Button variant="outline" onClick={loadMetrics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Cpu className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.system.cpu_usage.toFixed(1)}%</div>
              <Progress value={metrics.system.cpu_usage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {metrics.system.cpu_usage < 50 ? 'Normal load' : metrics.system.cpu_usage < 80 ? 'High load' : 'Critical load'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <MemoryStick className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.system.memory_usage}%</div>
              <Progress value={metrics.system.memory_usage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {metrics.system.memory_usage < 70 ? 'Healthy' : metrics.system.memory_usage < 85 ? 'Moderate' : 'High usage'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
              <HardDrive className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.system.disk_usage}%</div>
              <Progress value={metrics.system.disk_usage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {metrics.system.disk_usage < 50 ? 'Plenty of space' : metrics.system.disk_usage < 80 ? 'Monitor usage' : 'Low space'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <Activity className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.system.uptime}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Last updated: {new Date(metrics.system.last_updated).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Service Health Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Response time: {service.response_time}ms • Uptime: {service.uptime}%
                          </p>
                        </div>
                      </div>
                      <Badge variant={service.status === 'healthy' ? 'default' : service.status === 'warning' ? 'secondary' : 'destructive'}>
                        {service.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Connections</span>
                    <span className="text-sm">{metrics.database.connections}/{metrics.database.max_connections}</span>
                  </div>
                  <Progress value={(metrics.database.connections / metrics.database.max_connections) * 100} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Storage Used</span>
                    <span className="text-sm">{metrics.database.storage_used}%</span>
                  </div>
                  <Progress value={metrics.database.storage_used} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Query Performance</span>
                    <Badge variant="default">{metrics.database.query_performance}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Slow Queries (24h)</span>
                    <span className="text-sm text-warning">{metrics.database.slow_queries}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Backup Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-medium">Last Backup</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(metrics.database.last_backup).toLocaleDateString()} at{' '}
                        {new Date(metrics.database.last_backup).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant="default">{metrics.database.backup_status}</Badge>
                    <span className="text-sm text-muted-foreground">
                      Next backup scheduled in 18 hours
                    </span>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Database className="h-4 w-4 mr-2" />
                    Run Manual Backup
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Trends (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics.performance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="cpu" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.3)" />
                    <Area type="monotone" dataKey="memory" stackId="2" stroke="hsl(var(--success))" fill="hsl(var(--success) / 0.3)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Request Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={metrics.performance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="requests" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.alerts.map((alert) => (
                    <Alert key={alert.id} className={`${alert.acknowledged ? 'opacity-60' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getAlertIcon(alert.type)}
                          <div className="flex-1">
                            <h4 className="font-medium">{alert.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {alert.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {!alert.acknowledged && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminSystemMonitoring;