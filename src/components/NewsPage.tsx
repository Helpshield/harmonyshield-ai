import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import cryptoFraudImg from '@/assets/news/crypto-fraud.jpg';
import romanceScamImg from '@/assets/news/romance-scam.jpg';
import aiVoiceFraudImg from '@/assets/news/ai-voice-fraud.jpg';
import emailPhishingImg from '@/assets/news/email-phishing.jpg';
import investmentScamImg from '@/assets/news/investment-scam.jpg';
import cybersecurityBreachImg from '@/assets/news/cybersecurity-breach.jpg';
import { 
  Shield, 
  Newspaper, 
  ExternalLink, 
  Search, 
  Filter, 
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Globe,
  Eye,
  Clock
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AppLayout } from './AppLayout';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  category: 'fraud' | 'scam' | 'cybersecurity' | 'phishing' | 'crypto' | 'identity_theft' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const NewsPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('latest');
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      setLoading(false);
      loadNews();
    };

    checkUser();
    
    // Set up real-time updates every 5 minutes
    const interval = setInterval(loadNews, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [navigate]);

  const loadNews = async () => {
    try {
      // First, try to load from database
      const { data: dbArticles, error: dbError } = await supabase
        .from('news_articles')
        .select('*')
        .eq('is_active', true)
        .order('published_at', { ascending: false })
        .limit(50);

      if (dbArticles && dbArticles.length > 0) {
        // Map database articles to component format
        const formattedArticles = dbArticles.map(article => ({
          id: article.id,
          title: article.title,
          description: article.description || '',
          url: article.url,
          source: article.source_name,
          publishedAt: article.published_at,
          imageUrl: article.image_url,
          category: article.category as 'fraud' | 'scam' | 'cybersecurity' | 'phishing' | 'crypto' | 'identity_theft' | 'general',
          severity: article.severity as 'low' | 'medium' | 'high' | 'critical'
        }));
        
        setArticles(formattedArticles);
        setFilteredArticles(formattedArticles);
        return;
      }
      
      // Fallback: fetch fresh data from edge function if no database articles
      const { data, error } = await supabase.functions.invoke('fetch-news');
      
      if (error) {
        console.error('Error calling fetch-news function:', error);
        // Fallback to mock data if the function fails
        const mockArticles: NewsArticle[] = [
        {
          id: '1',
          title: 'New Cryptocurrency Phishing Campaign Targets Major Exchanges',
          description: 'Security researchers have identified a sophisticated phishing campaign targeting users of major cryptocurrency exchanges, stealing over $2M in digital assets.',
          url: 'https://example.com/crypto-phishing-alert',
          source: 'CyberSecurity News',
          publishedAt: new Date().toISOString(),
          category: 'crypto',
          severity: 'critical',
          imageUrl: cryptoFraudImg
        },
        {
          id: '2',
          title: 'Romance Scam Losses Reach Record High in 2024',
          description: 'Federal authorities report that romance scam losses have increased by 45% this year, with victims losing an average of $15,000 per incident.',
          url: 'https://example.com/romance-scam-report',
          source: 'FBI Consumer Alert',
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          category: 'scam',
          severity: 'high',
          imageUrl: romanceScamImg
        },
        {
          id: '3',
          title: 'AI-Powered Voice Cloning Used in Elder Fraud Schemes',
          description: 'Scammers are increasingly using AI voice cloning technology to impersonate family members in emergency scams targeting elderly victims.',
          url: 'https://example.com/ai-voice-scam',
          source: 'Tech Security Weekly',
          publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          category: 'fraud',
          severity: 'high',
          imageUrl: aiVoiceFraudImg
        },
        {
          id: '4',
          title: 'New Email Phishing Campaign Impersonates Tax Authorities',
          description: 'A widespread phishing campaign is targeting taxpayers with fake emails claiming urgent tax refunds, stealing personal and financial information.',
          url: 'https://example.com/tax-phishing-alert',
          source: 'Government Security Alert',
          publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          category: 'phishing',
          severity: 'medium',
          imageUrl: emailPhishingImg
        },
        {
          id: '5',
          title: 'Social Media Investment Scams Surge During Market Volatility',
          description: 'Fraudulent investment schemes on social platforms have increased 300% during recent market uncertainty, targeting inexperienced investors.',
          url: 'https://example.com/social-investment-scams',
          source: 'Financial Crime Watch',
          publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          category: 'fraud',
          severity: 'medium',
          imageUrl: investmentScamImg
        }
      ];
      
      setArticles(mockArticles);
      setFilteredArticles(mockArticles);
      return;
      }
      
      if (data?.success && data?.articles) {
        setArticles(data.articles);
        setFilteredArticles(data.articles);
      } else {
        // Fallback to some default articles if no data
        setArticles([]);
        setFilteredArticles([]);
      }
    } catch (error) {
      console.error('Error loading news:', error);
      toast({
        title: "Error",
        description: "Failed to load news articles",
        variant: "destructive",
      });
    }
  };

  const refreshNews = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
    toast({
      title: "Success",
      description: "News feed refreshed successfully",
    });
  };

  useEffect(() => {
    let filtered = articles;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(article => article.category === categoryFilter);
    }

    // Filter by source
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(article => article.source === sourceFilter);
    }

    // Sort by publication date
    filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    setFilteredArticles(filtered);
  }, [articles, searchTerm, categoryFilter, sourceFilter]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Low Risk</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium Risk</Badge>;
      case 'high':
        return <Badge variant="default">High Risk</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryMap = {
      fraud: { label: 'Fraud', variant: 'destructive' as const },
      scam: { label: 'Scam', variant: 'destructive' as const },
      cybersecurity: { label: 'Cybersecurity', variant: 'default' as const },
      phishing: { label: 'Phishing', variant: 'secondary' as const },
      crypto: { label: 'Crypto', variant: 'outline' as const },
      identity_theft: { label: 'Identity Theft', variant: 'destructive' as const },
      general: { label: 'General', variant: 'outline' as const }
    };

    const config = categoryMap[category] || { label: category, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const uniqueSources = [...new Set(articles.map(article => article.source))];

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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Scam & Fraud News Center
          </h1>
          <p className="text-muted-foreground">
            Real-time updates from trusted sources about the latest security threats and fraud trends
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">News Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search news articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="fraud">Fraud</SelectItem>
                  <SelectItem value="scam">Scam</SelectItem>
                  <SelectItem value="phishing">Phishing</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                  <SelectItem value="identity_theft">Identity Theft</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {uniqueSources.map(source => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="latest" className="gap-2">
              <Clock className="h-4 w-4" />
              Latest ({filteredArticles.length})
            </TabsTrigger>
            <TabsTrigger value="trending" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Security Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="latest" className="space-y-6">
            <div className="grid gap-6">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="shadow-card hover-lift">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {article.imageUrl && (
                        <div className="lg:w-64 flex-shrink-0">
                          <img 
                            src={article.imageUrl} 
                            alt={article.title}
                            className="w-full h-48 lg:h-32 object-cover rounded-md"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {getCategoryBadge(article.category)}
                          {getSeverityBadge(article.severity)}
                          <Badge variant="outline" className="gap-1">
                            <Globe className="h-3 w-3" />
                            {article.source}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {article.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatTimeAgo(article.publishedAt)}
                          </div>
                          <Button variant="outline" size="sm" className="gap-2" asChild>
                            <a href={article.url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                              Read More
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredArticles.length === 0 && (
                <Card className="shadow-card">
                  <CardContent className="text-center py-12">
                    <Newspaper className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No news articles found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Trending Security Topics</CardTitle>
                <CardDescription>Most discussed fraud and security topics this week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredArticles.filter(article => article.severity === 'critical' || article.severity === 'high').slice(0, 5).map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                    <div>
                      <p className="font-medium line-clamp-1">{article.title}</p>
                      <p className="text-sm text-muted-foreground">{article.source}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(article.severity)}
                      <Button variant="ghost" size="sm" asChild>
                        <a href={article.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Critical Security Alerts</CardTitle>
                <CardDescription>High-priority threats requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredArticles.filter(article => article.severity === 'critical').map((article) => (
                  <div key={article.id} className="border-l-4 border-destructive pl-4 py-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">{article.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{article.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{article.source}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(article.publishedAt)}</span>
                        </div>
                      </div>
                      <Button variant="destructive" size="sm" asChild>
                        <a href={article.url} target="_blank" rel="noopener noreferrer">
                          View Alert
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredArticles.filter(article => article.severity === 'critical').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No critical alerts at this time</p>
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

export default NewsPage;