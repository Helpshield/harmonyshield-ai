import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Users, 
  FileText, 
  BarChart3, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  Settings,
  UserCheck,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Bot
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AppLayout } from './AppLayout';
import RecentUserActivity from './RecentUserActivity';
import SystemMetrics from './SystemMetrics';
import SystemHealthStatus from './SystemHealthStatus';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('user');
  const [userCredits, setUserCredits] = useState(500);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalReports: 0,
    pendingReports: 0,
    threatsBlocked: 0,
    systemHealth: 'Operational',
    recoveryRequests: 0,
    pendingRecoveries: 0,
    totalScans: 0,
    deepSearches: 0,
    botSubscriptions: 0,
    trackingLinks: 0,
    threatReports: 0,
    newsArticles: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      
      setUser(session.user);
      
      // Check if user is admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      
      if (!roleData || roleData.role !== 'admin') {
        navigate('/dashboard');
        return;
      }
      
      setUserRole(roleData.role);
      setLoading(false);
      loadStats();
    };

    checkAdminAccess();
    
    // Set up real-time subscriptions for live data updates
    const channels = [
      supabase.channel('admin_profiles').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, loadStats),
      supabase.channel('admin_reports').on('postgres_changes', { event: '*', schema: 'public', table: 'scam_reports' }, loadStats),
      supabase.channel('admin_scans').on('postgres_changes', { event: '*', schema: 'public', table: 'scan_results' }, loadStats),
      supabase.channel('admin_recovery').on('postgres_changes', { event: '*', schema: 'public', table: 'recovery_requests' }, loadStats),
      supabase.channel('admin_threats').on('postgres_changes', { event: '*', schema: 'public', table: 'threat_reports' }, loadStats)
    ];
    
    channels.forEach(channel => channel.subscribe());
    
    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [navigate]);

  const loadStats = async () => {
    try {
      // Load comprehensive statistics with real data
      const [
        usersCount, reportsCount, pendingReportsCount, scanResultsCount, 
        botSubscriptionsCount, recoveryCount, pendingRecoveryCount, 
        deepSearchCount, trackingLinksCount, threatReportsCount, newsCount
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('scam_reports').select('id', { count: 'exact' }),
        supabase.from('scam_reports').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('scan_results').select('id', { count: 'exact' }),
        supabase.from('user_bot_subscriptions').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('recovery_requests').select('id', { count: 'exact' }),
        supabase.from('recovery_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('deep_search_requests').select('id', { count: 'exact' }),
        supabase.from('tracking_links').select('id', { count: 'exact' }),
        supabase.from('threat_reports').select('id', { count: 'exact' }),
        supabase.from('news_articles').select('id', { count: 'exact' }).eq('is_active', true)
      ]);

      // Calculate active users based on recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeUsersCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('updated_at', thirtyDaysAgo.toISOString());

      // Calculate threats blocked (scan results with high risk scores)
      const { count: threatsBlockedCount } = await supabase
        .from('scan_results')
        .select('id', { count: 'exact', head: true })
        .eq('risk_level', 'high');

      setStats({
        totalUsers: usersCount.count || 0,
        activeUsers: activeUsersCount || 0,
        totalReports: reportsCount.count || 0,
        pendingReports: pendingReportsCount.count || 0,
        threatsBlocked: threatsBlockedCount || 0,
        systemHealth: 'Operational',
        recoveryRequests: recoveryCount.count || 0,
        pendingRecoveries: pendingRecoveryCount.count || 0,
        totalScans: scanResultsCount.count || 0,
        deepSearches: deepSearchCount.count || 0,
        botSubscriptions: botSubscriptionsCount.count || 0,
        trackingLinks: trackingLinksCount.count || 0,
        threatReports: threatReportsCount.count || 0,
        newsArticles: newsCount.count || 0
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
    }
  };

  const switchToUserDashboard = () => {
    navigate('/dashboard');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully",
      description: "You have been logged out of your account.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-shield-pulse">
          <Shield className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            System overview and management tools
          </p>
        </div>

        {/* Primary Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover-lift shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">{stats.activeUsers} active this month</p>
            </CardContent>
          </Card>

          <Card className="hover-lift shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Scans</CardTitle>
              <Shield className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalScans}</div>
              <p className="text-xs text-muted-foreground">{stats.threatsBlocked} threats blocked</p>
            </CardContent>
          </Card>

          <Card className="hover-lift shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scam Reports</CardTitle>
              <FileText className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReports}</div>
              <p className="text-xs text-muted-foreground">{stats.pendingReports} pending review</p>
            </CardContent>
          </Card>

          <Card className="hover-lift shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recovery Requests</CardTitle>
              <TrendingUp className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recoveryRequests}</div>
              <p className="text-xs text-muted-foreground">{stats.pendingRecoveries} in progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover-lift shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deep Searches</CardTitle>
              <Eye className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.deepSearches}</div>
              <p className="text-xs text-muted-foreground">Advanced investigations</p>
            </CardContent>
          </Card>

          <Card className="hover-lift shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bot Subscriptions</CardTitle>
              <Bot className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.botSubscriptions}</div>
              <p className="text-xs text-muted-foreground">Active subscriptions</p>
            </CardContent>
          </Card>

          <Card className="hover-lift shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tracking Links</CardTitle>
              <Activity className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.trackingLinks}</div>
              <p className="text-xs text-muted-foreground">Monitoring active</p>
            </CardContent>
          </Card>

          <Card className="hover-lift shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Threat Reports</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.threatReports}</div>
              <p className="text-xs text-muted-foreground">Security alerts</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  System Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SystemMetrics />
              </CardContent>
            </Card>

            <RecentUserActivity />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SystemHealthStatus />
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/users')}>
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users ({stats.totalUsers})
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/reports')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Review Reports ({stats.pendingReports})
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/recovery')}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Recovery Jobs ({stats.pendingRecoveries})
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/threats')}>
                  <Shield className="h-4 w-4 mr-2" />
                  Threat Management ({stats.threatReports})
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/bots')}>
                  <Bot className="h-4 w-4 mr-2" />
                  Bot Management ({stats.botSubscriptions})
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/analytics')}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics Dashboard
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/ab-testing')}>
                  <Activity className="h-4 w-4 mr-2" />
                  A/B Testing
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/system-config')}>
                  <Settings className="h-4 w-4 mr-2" />
                  System Configuration
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/monitoring')}>
                  <Activity className="h-4 w-4 mr-2" />
                  System Monitoring  
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/security')}>
                  <Shield className="h-4 w-4 mr-2" />
                  Security Center
                </Button>
              </CardContent>
            </Card>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                System maintenance scheduled for Sunday 3:00 AM UTC. Expected downtime: 30 minutes.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;