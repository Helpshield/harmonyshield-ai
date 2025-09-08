import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Shield, 
  ExternalLink, 
  Search, 
  Filter,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Tag,
  TrendingUp,
  Newspaper,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AppLayout } from './AppLayout';

const SmartFeedsPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scamData, setScamData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThreatLevel, setSelectedThreatLevel] = useState('all');
  const [selectedScamType, setSelectedScamType] = useState('all');
  const [activeTab, setActiveTab] = useState('latest');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      await loadScamData();
      setLoading(false);
    };

    checkAuth();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('scam-database-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scam_database'
        },
        () => {
          loadScamData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const loadScamData = async () => {
    try {
      const { data, error } = await supabase
        .from('scam_database')
        .select('*')
        .eq('is_active', true)
        .order('reported_date', { ascending: false });

      if (error) throw error;
      setScamData(data || []);
      setFilteredData(data || []);
    } catch (error) {
      console.error('Error loading scam data:', error);
      toast({
        title: "Error",
        description: "Failed to load scam database",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    filterData();
  }, [searchQuery, selectedThreatLevel, selectedScamType, scamData, activeTab]);

  const filterData = () => {
    let filtered = [...scamData];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.platform_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.platform_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Threat level filter
    if (selectedThreatLevel !== 'all') {
      filtered = filtered.filter(item => item.threat_level === selectedThreatLevel);
    }

    // Scam type filter
    if (selectedScamType !== 'all') {
      filtered = filtered.filter(item => item.scam_type === selectedScamType);
    }

    // Tab-based filter
    const now = new Date();
    switch (activeTab) {
      case 'latest':
        // Already sorted by reported_date desc
        break;
      case 'trending':
        filtered = filtered.filter(item => {
          const reportedDate = new Date(item.reported_date);
          const daysDiff = Math.floor((now.getTime() - reportedDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff <= 7 && (item.victim_count || 0) > 100;
        });
        filtered.sort((a, b) => (b.victim_count || 0) - (a.victim_count || 0));
        break;
      case 'critical':
        filtered = filtered.filter(item => item.threat_level === 'critical');
        break;
    }

    setFilteredData(filtered);
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getScamTypeIcon = (type: string) => {
    switch (type) {
      case 'phishing':
        return <Shield className="h-4 w-4" />;
      case 'investment_scam':
        return <DollarSign className="h-4 w-4" />;
      case 'tech_support_scam':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just reported';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center">
            <Newspaper className="h-8 w-8 mr-3 text-primary" />
            Smart Feeds
          </h1>
          <p className="text-muted-foreground">
            Live database of reported scam platforms, malicious URLs, and threat intelligence from trusted sources worldwide
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <div className="ml-3">
                  <p className="text-xs text-muted-foreground">Total Threats</p>
                  <p className="text-lg font-bold">{formatNumber(scamData.length)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-orange-500" />
                <div className="ml-3">
                  <p className="text-xs text-muted-foreground">Total Victims</p>
                  <p className="text-lg font-bold">
                    {formatNumber(scamData.reduce((sum, item) => sum + (item.victim_count || 0), 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center">
                <DollarSign className="h-6 w-6 text-green-500" />
                <div className="ml-3">
                  <p className="text-xs text-muted-foreground">Financial Impact</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(scamData.reduce((sum, item) => sum + (item.financial_impact || 0), 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingUp className="h-6 w-6 text-blue-500" />
                <div className="ml-3">
                  <p className="text-xs text-muted-foreground">This Week</p>
                  <p className="text-lg font-bold">
                    {scamData.filter(item => {
                      const date = new Date(item.reported_date);
                      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                      return date >= weekAgo;
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert */}
        <Alert className="mb-6 border-orange-500/20 bg-orange-500/5">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Live Threat Intelligence:</strong> This database is updated in real-time from trusted sources including FBI IC3, FTC, Anti-Phishing Working Group, and verified community reports. Always verify suspicious platforms before engaging.
          </AlertDescription>
        </Alert>

        {/* Filters */}
        <Card className="shadow-card mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search platforms, URLs, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <select
                value={selectedThreatLevel}
                onChange={(e) => setSelectedThreatLevel(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Threat Levels</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              
              <select
                value={selectedScamType}
                onChange={(e) => setSelectedScamType(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Scam Types</option>
                <option value="phishing">Phishing</option>
                <option value="investment_scam">Investment Scam</option>
                <option value="tech_support_scam">Tech Support Scam</option>
                <option value="malware">Malware</option>
              </select>
              
              <Button variant="outline" onClick={loadScamData} className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Refresh Feed
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="latest" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Latest Reports</span>
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Trending</span>
            </TabsTrigger>
            <TabsTrigger value="critical" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Critical Threats</span>
            </TabsTrigger>
          </TabsList>

          {/* Content */}
          {['latest', 'trending', 'critical'].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {filteredData.length === 0 ? (
                <Card className="shadow-card">
                  <CardContent className="text-center py-12">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No threats match your current filters</p>
                    <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
                  </CardContent>
                </Card>
              ) : (
                filteredData.map((scam) => (
                  <Card key={scam.id} className="shadow-card hover-lift">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <div className="flex items-center space-x-3 mb-3 md:mb-0">
                          {getScamTypeIcon(scam.scam_type)}
                          <h3 className="font-bold text-lg">{scam.platform_name}</h3>
                          <Badge className={getThreatLevelColor(scam.threat_level)}>
                            {scam.threat_level.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            {formatNumber(scam.victim_count || 0)} victims
                          </Badge>
                          {scam.financial_impact > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <DollarSign className="h-3 w-3 mr-1" />
                              {formatCurrency(scam.financial_impact)}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {getTimeAgo(scam.reported_date)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm bg-muted/30 p-2 rounded font-mono">
                          <ExternalLink className="h-4 w-4" />
                          <span className="text-destructive">{scam.platform_url}</span>
                        </div>
                        
                        <p className="text-muted-foreground text-sm">{scam.description}</p>
                        
                        <div className="flex flex-wrap items-center justify-between">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              {scam.country}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Shield className="h-3 w-3 mr-1" />
                              {scam.source_name}
                            </div>
                          </div>
                          
                          {scam.tags && scam.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {scam.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                              {scam.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{scam.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default SmartFeedsPage;