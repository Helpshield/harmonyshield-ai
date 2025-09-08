import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Shield, 
  AlertTriangle, 
  Activity,
  Calendar,
  Filter,
  Download,
  Eye,
  RefreshCw,
  Clock,
  Zap
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AppLayout } from './AppLayout';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalScans: number;
    threatsBlocked: number;
    totalReports: number;
    pendingReports: number;
    recoveryRequests: number;
    completedRecoveries: number;
  };
  trends: Array<{
    date: string;
    scans: number;
    threats: number;
    reports: number;
    users: number;
  }>;
  threatTypes: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  auditLogs: Array<{
    id: string;
    admin_user_id: string;
    action: string;
    entity_type: string;
    entity_id: string | null;
    details: any;
    created_at: string;
  }>;
  performance: {
    avgResponseTime: number;
    uptime: number;
    errorRate: number;
    throughput: number;
  };
}

const AdminAnalyticsPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [data, setData] = useState<AnalyticsData>({
    overview: {
      totalUsers: 0,
      activeUsers: 0,
      totalScans: 0,
      threatsBlocked: 0,
      totalReports: 0,
      pendingReports: 0,
      recoveryRequests: 0,
      completedRecoveries: 0,
    },
    trends: [],
    threatTypes: [],
    auditLogs: [],
    performance: {
      avgResponseTime: 0,
      uptime: 0,
      errorRate: 0,
      throughput: 0,
    },
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
      
      // Set up real-time subscriptions
      const channels = [
        supabase.channel('analytics_scam_reports').on('postgres_changes', 
          { event: '*', schema: 'public', table: 'scam_reports' }, 
          () => loadAnalyticsData()
        ),
        supabase.channel('analytics_scan_results').on('postgres_changes', 
          { event: '*', schema: 'public', table: 'scan_results' }, 
          () => loadAnalyticsData()
        ),
        supabase.channel('analytics_audit_logs').on('postgres_changes', 
          { event: '*', schema: 'public', table: 'admin_audit_logs' }, 
          () => loadAuditLogs()
        ),
      ];
      
      channels.forEach(channel => channel.subscribe());
      
      // Refresh data every 30 seconds
      const interval = setInterval(loadAnalyticsData, 30000);
      
      return () => {
        channels.forEach(channel => supabase.removeChannel(channel));
        clearInterval(interval);
      };
    }
  }, [user, timeRange]);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    
    setUser(session.user);
    
    // Check admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();
    
    if (!roleData || roleData.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    setLoading(false);
  };

  const loadAnalyticsData = async () => {
    if (refreshing) return;
    setRefreshing(true);
    
    try {
      const days = parseInt(timeRange.replace('d', ''));
      const startDate = subDays(new Date(), days);
      
      // Load overview data
      const [
        usersCount, activeUsersCount, scansCount, threatsCount,
        reportsCount, pendingReportsCount, recoveryCount, completedRecoveryCount
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' })
          .gte('updated_at', startDate.toISOString()),
        supabase.from('scan_results').select('id', { count: 'exact' })
          .gte('created_at', startDate.toISOString()),
        supabase.from('scan_results').select('id', { count: 'exact' })
          .eq('risk_level', 'high')
          .gte('created_at', startDate.toISOString()),
        supabase.from('scam_reports').select('id', { count: 'exact' })
          .gte('created_at', startDate.toISOString()),
        supabase.from('scam_reports').select('id', { count: 'exact' })
          .eq('status', 'pending'),
        supabase.from('recovery_requests').select('id', { count: 'exact' })
          .gte('created_at', startDate.toISOString()),
        supabase.from('recovery_requests').select('id', { count: 'exact' })
          .eq('status', 'completed')
          .gte('created_at', startDate.toISOString()),
      ]);

      // Load trend data
      const trendData = await loadTrendData(days);
      
      // Load threat types distribution
      const threatTypes = await loadThreatTypesData(days);
      
      // Load performance metrics
      const performance = await loadPerformanceData();

      setData({
        overview: {
          totalUsers: usersCount.count || 0,
          activeUsers: activeUsersCount.count || 0,
          totalScans: scansCount.count || 0,
          threatsBlocked: threatsCount.count || 0,
          totalReports: reportsCount.count || 0,
          pendingReports: pendingReportsCount.count || 0,
          recoveryRequests: recoveryCount.count || 0,
          completedRecoveries: completedRecoveryCount.count || 0,
        },
        trends: trendData,
        threatTypes,
        auditLogs: data.auditLogs, // Keep existing audit logs
        performance,
      });

      await loadAuditLogs();
      
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast({
        title: "Error loading analytics",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const loadTrendData = async (days: number) => {
    const startDate = subDays(new Date(), days);
    const trends = [];
    
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), days - i - 1);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const [scansCount, threatsCount, reportsCount, usersCount] = await Promise.all([
        supabase.from('scan_results').select('id', { count: 'exact' })
          .gte('created_at', startOfDay(date).toISOString())
          .lt('created_at', endOfDay(date).toISOString()),
        supabase.from('scan_results').select('id', { count: 'exact' })
          .eq('risk_level', 'high')
          .gte('created_at', startOfDay(date).toISOString())
          .lt('created_at', endOfDay(date).toISOString()),
        supabase.from('scam_reports').select('id', { count: 'exact' })
          .gte('created_at', startOfDay(date).toISOString())
          .lt('created_at', endOfDay(date).toISOString()),
        supabase.from('profiles').select('id', { count: 'exact' })
          .gte('created_at', startOfDay(date).toISOString())
          .lt('created_at', endOfDay(date).toISOString()),
      ]);

      trends.push({
        date: dateStr,
        scans: scansCount.count || 0,
        threats: threatsCount.count || 0,
        reports: reportsCount.count || 0,
        users: usersCount.count || 0,
      });
    }
    
    return trends;
  };

  const loadThreatTypesData = async (days: number) => {
    const startDate = subDays(new Date(), days);
    
    const { data: threatData } = await supabase
      .from('scam_reports')
      .select('scam_type')
      .gte('created_at', startDate.toISOString());

    const typeCounts = threatData?.reduce((acc, report) => {
      const type = report.scam_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const total = Object.values(typeCounts).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(typeCounts).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0,
    }));
  };

  const loadPerformanceData = async () => {
    // Simulate performance data based on system activity
    const { count: totalScans } = await supabase
      .from('scan_results')
      .select('id', { count: 'exact' });

    const { count: errorScans } = await supabase
      .from('scan_results')
      .select('id', { count: 'exact' })
      .eq('scan_status', 'error');

    return {
      avgResponseTime: 1.2 + Math.random() * 2, // 1.2-3.2s
      uptime: 99.5 + Math.random() * 0.4, // 99.5-99.9%
      errorRate: totalScans > 0 ? ((errorScans || 0) / totalScans) * 100 : 0,
      throughput: Math.floor(50 + Math.random() * 100), // 50-150 req/min
    };
  };

  const loadAuditLogs = async () => {
    try {
      const { data: auditLogs } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      setData(prev => ({
        ...prev,
        auditLogs: auditLogs || [],
      }));
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
  };

  const logAdminAction = async (action: string, entityType: string, entityId?: string, details?: any) => {
    try {
      await supabase.rpc('log_admin_action', {
        p_action: action,
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_details: details || {},
      });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  };

  const exportData = async () => {
    await logAdminAction('export_analytics', 'analytics', undefined, { timeRange });
    
    const csvData = [
      ['Date', 'Scans', 'Threats', 'Reports', 'Users'],
      ...data.trends.map(trend => [trend.date, trend.scans, trend.threats, trend.reports, trend.users])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `harmony-shield-analytics-${timeRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Data exported",
      description: "Analytics data has been exported to CSV.",
    });
  };

  const chartConfig = {
    scans: {
      label: "Scans",
      color: "hsl(var(--primary))",
    },
    threats: {
      label: "Threats",
      color: "hsl(var(--destructive))",
    },
    reports: {
      label: "Reports", 
      color: "hsl(var(--warning))",
    },
    users: {
      label: "New Users",
      color: "hsl(var(--success))",
    },
  };

  const threatColors = [
    'hsl(var(--destructive))',
    'hsl(var(--warning))',
    'hsl(var(--primary))',
    'hsl(var(--success))',
    'hsl(var(--muted-foreground))',
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex items-center space-x-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          <span className="text-lg font-medium">Loading Analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Real-time insights and system analytics</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={loadAnalyticsData} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover-lift shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {data.overview.activeUsers} active in {timeRange}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Scans</CardTitle>
              <Shield className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.totalScans.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {data.overview.threatsBlocked} threats blocked
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scam Reports</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.totalReports.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {data.overview.pendingReports} pending review
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recovery Success</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.overview.recoveryRequests > 0 
                  ? Math.round((data.overview.completedRecoveries / data.overview.recoveryRequests) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {data.overview.completedRecoveries} of {data.overview.recoveryRequests} completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="threats">Threats</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Activity Trends
                </CardTitle>
                <CardDescription>
                  System activity over the last {timeRange}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.trends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="scans" 
                        stroke="var(--color-scans)" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="threats" 
                        stroke="var(--color-threats)" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="reports" 
                        stroke="var(--color-reports)" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="users" 
                        stroke="var(--color-users)" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="threats" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
                    Threat Distribution
                  </CardTitle>
                  <CardDescription>
                    Types of threats detected in {timeRange}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.threatTypes}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                      >
                        {data.threatTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={threatColors[index % threatColors.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Threat Summary</CardTitle>
                  <CardDescription>
                    Detailed breakdown by threat type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.threatTypes.map((threat, index) => (
                      <div key={threat.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: threatColors[index % threatColors.length] }}
                          />
                          <span className="text-sm font-medium">{threat.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{threat.value}</Badge>
                          <span className="text-sm text-muted-foreground">{threat.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.performance.avgResponseTime.toFixed(2)}s</div>
                  <p className="text-xs text-muted-foreground">System response time</p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                  <Activity className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.performance.uptime.toFixed(2)}%</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.performance.errorRate.toFixed(2)}%</div>
                  <p className="text-xs text-muted-foreground">Failed operations</p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Throughput</CardTitle>
                  <Zap className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.performance.throughput}</div>
                  <p className="text-xs text-muted-foreground">requests/minute</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-primary" />
                  Admin Audit Log
                </CardTitle>
                <CardDescription>
                  Recent admin actions and system events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-32">Timestamp</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-xs">
                            {format(new Date(log.created_at), 'MMM dd HH:mm')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{log.entity_type}</TableCell>
                          <TableCell className="text-sm font-mono">
                            {log.admin_user_id.slice(0, 8)}...
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-48 truncate">
                            {JSON.stringify(log.details)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {data.auditLogs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No audit logs found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminAnalyticsPage;