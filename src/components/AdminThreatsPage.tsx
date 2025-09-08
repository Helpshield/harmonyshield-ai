import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Clock, 
  TrendingUp, 
  Eye,
  RefreshCw,
  Bell,
  Target,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from './AppLayout';

interface ThreatReport {
  id: string;
  title: string;
  description: string;
  threat_type: string;
  severity: string;
  status: string;
  threat_score: number;
  detection_methods: string[];
  affected_systems: string[];
  recommendations: string[];
  first_detected_at: string;
  last_updated_at: string;
  resolved_at?: string;
  source_data: any;
}

interface ThreatIndicator {
  id: string;
  threat_report_id: string;
  indicator_type: string;
  indicator_value: string;
  confidence_level: number;
  created_at: string;
}

const AdminThreatsPage = () => {
  const [threatReports, setThreatReports] = useState<ThreatReport[]>([]);
  const [threatIndicators, setThreatIndicators] = useState<ThreatIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    critical: 0,
    avgScore: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchThreatReports();
    fetchThreatIndicators();

    // Set up real-time subscriptions
    const threatReportsChannel = supabase
      .channel('threat-reports-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'threat_reports'
        },
        () => {
          fetchThreatReports();
        }
      )
      .subscribe();

    const threatIndicatorsChannel = supabase
      .channel('threat-indicators-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'threat_indicators'
        },
        () => {
          fetchThreatIndicators();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(threatReportsChannel);
      supabase.removeChannel(threatIndicatorsChannel);
    };
  }, []);

  const fetchThreatReports = async () => {
    try {
      const { data, error } = await supabase
        .from('threat_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setThreatReports(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const active = data?.filter(report => report.status === 'active').length || 0;
      const critical = data?.filter(report => report.severity === 'critical').length || 0;
      const avgScore = total > 0 ? Math.round(data.reduce((sum, report) => sum + (report.threat_score || 0), 0) / total) : 0;
      
      setStats({ total, active, critical, avgScore });
    } catch (error) {
      console.error('Error fetching threat reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch threat reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchThreatIndicators = async () => {
    try {
      const { data, error } = await supabase
        .from('threat_indicators')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setThreatIndicators(data || []);
    } catch (error) {
      console.error('Error fetching threat indicators:', error);
    }
  };

  const generateThreatReports = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-threat-reports', {
        body: { trigger: 'manual' }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Threat reports generated successfully",
      });

      // Refresh data
      fetchThreatReports();
      fetchThreatIndicators();
    } catch (error) {
      console.error('Error generating threat reports:', error);
      toast({
        title: "Error",
        description: "Failed to generate threat reports",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const updateThreatStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('threat_reports')
        .update({ 
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Threat status updated successfully",
      });
    } catch (error) {
      console.error('Error updating threat status:', error);
      toast({
        title: "Error",
        description: "Failed to update threat status",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'destructive';
      case 'investigating': return 'default';
      case 'monitoring': return 'secondary';
      case 'resolved': return 'outline';
      default: return 'outline';
    }
  };

  const filteredReports = threatReports.filter(report => {
    if (filter === 'all') return true;
    if (filter === 'active') return report.status === 'active';
    if (filter === 'critical') return report.severity === 'critical';
    if (filter === 'high') return report.severity === 'high';
    return true;
  });

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Threat Reports</h1>
          <p className="text-muted-foreground">Real-time threat intelligence and security monitoring</p>
        </div>
        <Button 
          onClick={generateThreatReports} 
          disabled={isGenerating}
          className="bg-destructive hover:bg-destructive/90"
        >
          {isGenerating ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Activity className="h-4 w-4 mr-2" />
          )}
          Generate Reports
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Threats</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <Bell className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.critical}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Threat Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <div className="flex gap-2">
          {['all', 'active', 'critical', 'high'].map((filterOption) => (
            <Button
              key={filterOption}
              variant={filter === filterOption ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterOption)}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Threat Reports */}
      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Threat Reports</TabsTrigger>
          <TabsTrigger value="indicators">Threat Indicators</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No threat reports found</p>
              </CardContent>
            </Card>
          ) : (
            filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <Badge variant={getSeverityColor(report.severity)}>
                          {report.severity.toUpperCase()}
                        </Badge>
                        <Badge variant={getStatusColor(report.status)}>
                          {report.status.toUpperCase()}
                        </Badge>
                      </div>
                      <CardDescription>{report.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-destructive">{report.threat_score}</div>
                      <p className="text-xs text-muted-foreground">Threat Score</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Progress value={report.threat_score} className="flex-1" />
                    <span className="text-sm text-muted-foreground">{report.threat_score}%</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Detection Methods</h4>
                      <div className="space-y-1">
                        {report.detection_methods?.map((method, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {method}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Affected Systems</h4>
                      <div className="space-y-1">
                        {report.affected_systems?.map((system, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {system}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Recommendations</h4>
                      <ul className="text-xs space-y-1">
                        {report.recommendations?.slice(0, 2).map((rec, idx) => (
                          <li key={idx} className="text-muted-foreground">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Detected: {new Date(report.first_detected_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        Updated: {new Date(report.last_updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {report.status !== 'resolved' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateThreatStatus(report.id, 'investigating')}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Investigate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateThreatStatus(report.id, 'resolved')}
                          >
                            <Target className="h-3 w-3 mr-1" />
                            Resolve
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="indicators" className="space-y-4">
          <div className="grid gap-4">
            {threatIndicators.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">No threat indicators found</p>
                </CardContent>
              </Card>
            ) : (
              threatIndicators.map((indicator) => (
                <Card key={indicator.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{indicator.indicator_type}</Badge>
                          <span className="text-sm font-medium">{indicator.indicator_value}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(indicator.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {Math.round(indicator.confidence_level * 100)}%
                        </div>
                        <p className="text-xs text-muted-foreground">Confidence</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Auto-refresh Notice */}
      <Alert>
        <Activity className="h-4 w-4" />
        <AlertDescription>
          Threat reports are automatically generated every hour and updated in real-time. 
          Data is synchronized with your security infrastructure.
        </AlertDescription>
      </Alert>
      </div>
    </AppLayout>
  );
};

export default AdminThreatsPage;