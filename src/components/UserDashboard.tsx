import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Bell, 
  Eye,
  FileText,
  BarChart3,
  Search,
  User,
  Settings,
  Clock,
  DollarSign,
  ScanLine,
  Activity,
  CreditCard,
  Bitcoin,
  Newspaper,
  Users,
  ArrowUpRight
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AppLayout } from './AppLayout';
import HarmonyAI from './HarmonyAI';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('user');
  const [dashboardStats, setDashboardStats] = useState({
    totalScans: 0,
    recentScans: 0,
    recoveryRequests: 0,
    reportsSubmitted: 0,
    threatsBlocked: 0,
    safetyScore: 95
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      
      // Load user profile
      await loadUserProfile(session.user.id);
      
      // Check user role from database
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      
      if (roleData) {
        setUserRole(roleData.role);
      }

      // Load dashboard data
      await loadDashboardData(session.user.id);
      
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        loadUserProfile(session.user.id);
        loadDashboardData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (profile) {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadDashboardData = async (userId: string) => {
    try {
      // Load scan results
      const { data: scanResults } = await supabase
        .from('scan_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Load recovery requests
      const { data: recoveryRequests } = await supabase
        .from('recovery_requests')
        .select('*')
        .eq('user_id', userId);

      // Load scam reports
      const { data: scamReports } = await supabase
        .from('scam_reports')
        .select('*')
        .eq('user_id', userId);

      // Load notifications
      const { data: userNotifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      // Calculate stats
      const totalScans = scanResults?.length || 0;
      const recentScans = scanResults?.filter(scan => 
        new Date(scan.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      )?.length || 0;
      
      const threatsBlocked = scanResults?.filter(scan => 
        scan.risk_level === 'high' || scan.overall_score > 70
      )?.length || 0;

      // Create recent activities from actual data
      const activities = [];
      
      if (scanResults && scanResults.length > 0) {
        scanResults.slice(0, 3).forEach(scan => {
          activities.push({
            title: `${scan.scan_type} scan completed`,
            description: `${scan.target_content.substring(0, 30)}... - ${getTimeAgo(scan.created_at)}`,
            status: scan.risk_level === 'high' ? 'blocked' : scan.risk_level === 'medium' ? 'warning' : 'safe',
            icon: ScanLine
          });
        });
      }

      if (recoveryRequests && recoveryRequests.length > 0) {
        recoveryRequests.slice(0, 2).forEach(request => {
          activities.push({
            title: `Recovery request ${request.status}`,
            description: `${request.title} - ${getTimeAgo(request.created_at)}`,
            status: request.status === 'completed' ? 'safe' : request.status === 'in_progress' ? 'warning' : 'pending',
            icon: DollarSign
          });
        });
      }

      if (scamReports && scamReports.length > 0) {
        scamReports.slice(0, 2).forEach(report => {
          activities.push({
            title: `Scam report submitted`,
            description: `${report.title} - ${getTimeAgo(report.created_at)}`,
            status: report.status === 'verified' ? 'safe' : 'pending',
            icon: FileText
          });
        });
      }

      setDashboardStats({
        totalScans,
        recentScans,
        recoveryRequests: recoveryRequests?.length || 0,
        reportsSubmitted: scamReports?.length || 0,
        threatsBlocked,
        safetyScore: Math.max(95 - (threatsBlocked * 5), 60)
      });

      setRecentActivities(activities.slice(0, 5));
      setNotifications(userNotifications || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getActivityBadgeVariant = (status: string) => {
    switch (status) {
      case 'blocked': return 'destructive';
      case 'warning': return 'secondary';
      case 'safe': return 'default';
      default: return 'outline';
    }
  };

  const getActivityBadgeText = (status: string) => {
    switch (status) {
      case 'blocked': return 'Blocked';
      case 'warning': return 'Warning';
      case 'safe': return 'Safe';
      case 'pending': return 'Pending';
      default: return status;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-shield-pulse">
            <Shield className="h-12 w-12 text-primary" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {userProfile?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0]}
            </h2>
            <p className="text-muted-foreground">
              Your digital protection center - stay safe, stay informed
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {(userProfile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <Badge variant="secondary" className="capitalize">
                {userRole}
              </Badge>
            </div>
          </div>
        </div>

        {/* Notifications Alert */}
        {notifications.length > 0 && (
          <Alert className="mb-6 border-primary/20 bg-primary/5">
            <Bell className="h-4 w-4" />
            <AlertDescription>
              You have {notifications.length} unread notification{notifications.length > 1 ? 's' : ''}. 
              <Button variant="link" className="p-0 ml-2" onClick={() => navigate('/alerts')}>
                View all
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover-lift shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <ScanLine className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Scans</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalScans}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Threats Blocked</p>
                  <p className="text-2xl font-bold">{dashboardStats.threatsBlocked}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Reports</p>
                  <p className="text-2xl font-bold">{dashboardStats.reportsSubmitted}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Safety Score</p>
                  <p className="text-2xl font-bold">{dashboardStats.safetyScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Button 
            variant="outline" 
            className="h-20 flex flex-col space-y-2"
            onClick={() => navigate('/scanner')}
          >
            <ScanLine className="h-5 w-5" />
            <span className="text-sm">Scan URL</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col space-y-2"
            onClick={() => navigate('/deepsearch')}
          >
            <Search className="h-5 w-5" />
            <span className="text-sm">Deep Search</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col space-y-2"
            onClick={() => navigate('/recovery')}
          >
            <DollarSign className="h-5 w-5" />
            <span className="text-sm">Recovery</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col space-y-2"
            onClick={() => navigate('/reports')}
          >
            <FileText className="h-5 w-5" />
            <span className="text-sm">Report Scam</span>
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-primary" />
                    Recent Activity
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
                    View all
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                    <p className="text-sm">Start by scanning a URL or reporting a scam</p>
                  </div>
                ) : (
                  recentActivities.map((activity, index) => {
                    const IconComponent = activity.icon;
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                        <div className="flex items-center space-x-3">
                          <IconComponent className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium text-sm">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">{activity.description}</p>
                          </div>
                        </div>
                        <Badge variant={getActivityBadgeVariant(activity.status)}>
                          {getActivityBadgeText(activity.status)}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Platform Overview */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-primary" />
                Platform Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                  <div className="flex items-center space-x-2">
                    <ScanLine className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">AI Scanner</span>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Deep Search</span>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Recovery Service</span>
                  </div>
                  <Badge variant="default">Available</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Newspaper className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Threat Intelligence</span>
                  </div>
                  <Badge variant="default">Live</Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Weekly Trend:</strong> 23% increase in phishing attempts detected across social platforms.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>

        <HarmonyAI />
      </div>
    </AppLayout>
  );
};

export default UserDashboard;