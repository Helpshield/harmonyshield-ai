import React, { useState, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Image,
  Combine,
  Upload,
  Loader2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  User,
  Building,
  Globe,
  Shield,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  AlertTriangle,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  result_type: string;
  source_name: string;
  source_url?: string;
  title: string;
  description?: string;
  content?: string;
  confidence_score: number;
  relevance_score: number;
  metadata: any;
  created_at: string;
  image_urls?: string[];
  social_media_analysis?: {
    platform?: string;
    authenticity_status?: string;
    risk_level?: string;
  };
  fraud_risk_score?: number;
  fake_profile_indicators?: string[];
}

interface SearchRequest {
  id: string;
  search_type: string;
  search_query?: string;
  image_urls?: string[];
  search_status: string;
  created_at: string;
  completed_at?: string;
}

const DeepSearchPage = () => {
  const [searchType, setSearchType] = useState<'text' | 'image' | 'combined'>('text');
  const [searchQuery, setSearchQuery] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchRequest[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch search history on component mount
  React.useEffect(() => {
    fetchSearchHistory();
  }, []);

  const fetchSearchHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('deep_search_requests')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSearchHistory(data || []);
    } catch (error) {
      console.error('Error fetching search history:', error);
    }
  };

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImageUrls: string[] = [];
    
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newImageUrls.push(e.target.result as string);
          if (newImageUrls.length === files.length) {
            setImageUrls(prev => [...prev, ...newImageUrls]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const performDeepSearch = async () => {
    if (!searchQuery && imageUrls.length === 0) {
      toast({
        title: "Search Required",
        description: "Please enter a search query or upload an image.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      setProgress(10);
      setSearchResults([]);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      setProgress(30);

      const response = await supabase.functions.invoke('deep-search', {
        body: {
          searchType,
          searchQuery: searchQuery || undefined,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
          userId: session.user.id
        }
      });

      setProgress(60);

      if (response.error) {
        throw new Error(response.error.message || 'Search failed');
      }

      const { searchRequestId } = response.data;
      setCurrentSearchId(searchRequestId);
      setProgress(80);

      // Poll for results
      await pollForResults(searchRequestId);
      setProgress(100);

      toast({
        title: "Search Completed",
        description: `Found ${searchResults.length} results`,
      });

      // Refresh search history
      fetchSearchHistory();

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: error.message || "An error occurred during the search",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const deleteSearch = async (searchId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('deep_search_requests')
        .delete()
        .eq('id', searchId)
        .eq('user_id', session.user.id);

      if (error) throw error;

      toast({
        title: "Search Deleted",
        description: "Search history and results have been removed.",
      });

      // Refresh search history
      fetchSearchHistory();
    } catch (error) {
      console.error('Error deleting search:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete search. Please try again.",
        variant: "destructive"
      });
    }
  };

  const viewSearchResults = async (searchId: string) => {
    try {
      const { data, error } = await supabase
        .from('deep_search_results')
        .select('*')
        .eq('search_request_id', searchId)
        .order('relevance_score', { ascending: false });

      if (error) throw error;
      
      // Convert database results to SearchResult interface
      const convertedResults: SearchResult[] = (data || []).map(item => ({
        ...item,
        social_media_analysis: item.social_media_analysis as any,
        fraud_risk_score: item.fraud_risk_score || 0,
        fake_profile_indicators: item.fake_profile_indicators || []
      }));
      
      setSearchResults(convertedResults);

      toast({
        title: "Results Loaded",
        description: `Loaded ${data?.length || 0} previous results`,
      });
    } catch (error) {
      console.error('Error loading search results:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load search results.",
        variant: "destructive"
      });
    }
  };
  const pollForResults = async (searchRequestId: string, maxAttempts = 10) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const { data, error } = await supabase
          .from('deep_search_results')
          .select('*')
          .eq('search_request_id', searchRequestId)
          .order('relevance_score', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          // Convert database results to SearchResult interface
          const convertedResults: SearchResult[] = data.map(item => ({
            ...item,
            social_media_analysis: item.social_media_analysis as any,
            fraud_risk_score: item.fraud_risk_score || 0,
            fake_profile_indicators: item.fake_profile_indicators || []
          }));
          
          setSearchResults(convertedResults);
          return;
        }

        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Error polling for results:', error);
      }
    }
  };

  const getResultTypeIcon = (type: string) => {
    switch (type) {
      case 'fraud_analysis': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'web_search': return <Globe className="h-4 w-4" />;
      case 'image_analysis': return <Image className="h-4 w-4" />;
      case 'entity_info': return <User className="h-4 w-4" />;
      case 'social_media': return <TrendingUp className="h-4 w-4" />;
      case 'news_mention': return <AlertCircle className="h-4 w-4" />;
      case 'public_record': return <Building className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getRiskLevelBadge = (riskLevel?: string, score?: number) => {
    if (!riskLevel && !score) return null;
    
    const level = riskLevel || (score && score > 0.7 ? 'High' : score && score > 0.4 ? 'Medium' : 'Low');
    const variant = level === 'High' ? 'destructive' : level === 'Medium' ? 'secondary' : 'outline';
    
    return (
      <Badge variant={variant} className="text-xs">
        {level} Risk
      </Badge>
    );
  };

  const getFraudIndicators = (indicators?: string[]) => {
    if (!indicators || indicators.length === 0) return null;
    
    return (
      <div className="mt-2 space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Fraud Indicators:</p>
        <div className="flex flex-wrap gap-1">
          {indicators.map((indicator, index) => (
            <Badge key={index} variant="outline" className="text-xs bg-destructive/5 text-destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {indicator}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'processing': return <Loader2 className="h-4 w-4 text-warning animate-spin" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Deep Lookup</h1>
              <p className="text-muted-foreground">AI-powered background search and investigation</p>
            </div>
          </div>
          
          <Alert className="border-primary/20 bg-primary/5">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              This tool searches publicly available information from legitimate sources. All searches are logged and comply with privacy regulations.
            </AlertDescription>
          </Alert>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Panel */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>New Search</span>
                </CardTitle>
                <CardDescription>
                  Search for information about individuals, companies, or entities using text, images, or both.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Type Selection */}
                <Tabs value={searchType} onValueChange={(value) => setSearchType(value as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="text" className="flex items-center space-x-2">
                      <Search className="h-4 w-4" />
                      <span>Text</span>
                    </TabsTrigger>
                    <TabsTrigger value="image" className="flex items-center space-x-2">
                      <Image className="h-4 w-4" />
                      <span>Image</span>
                    </TabsTrigger>
                    <TabsTrigger value="combined" className="flex items-center space-x-2">
                      <Combine className="h-4 w-4" />
                      <span>Combined</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Search Query</label>
                      <Textarea
                        placeholder="Enter names, companies, websites, or any information you want to investigate..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="image" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Upload Images</label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Drop images here or click to upload
                        </p>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="max-w-xs mx-auto"
                        />
                      </div>
                      {imageUrls.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-4">
                          {imageUrls.map((url, index) => (
                            <div key={index} className="relative">
                              <img 
                                src={url} 
                                alt={`Upload ${index + 1}`}
                                className="w-full h-20 object-cover rounded border"
                              />
                              <Button
                                size="sm"
                                variant="destructive"
                                className="absolute top-1 right-1 h-6 w-6 p-0"
                                onClick={() => setImageUrls(prev => prev.filter((_, i) => i !== index))}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="combined" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Search Query</label>
                      <Textarea
                        placeholder="Enter text information to complement image analysis..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Upload Images</label>
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="max-w-xs mx-auto"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Progress Bar */}
                {isLoading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Processing search...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {/* Search Button */}
                <Button 
                  onClick={performDeepSearch}
                  disabled={isLoading || (!searchQuery && imageUrls.length === 0)}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Start Deep Search
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <Card className="mt-6 shadow-card">
                <CardHeader>
                  <CardTitle>Search Results ({searchResults.length})</CardTitle>
                  <CardDescription>
                    Information gathered from public sources and AI analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {searchResults.map((result) => (
                      <div 
                        key={result.id}
                        className="border rounded-lg p-4 hover:shadow-card transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getResultTypeIcon(result.result_type)}
                            <Badge variant="outline" className="text-xs">
                              {result.result_type.replace('_', ' ')}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {result.source_name}
                            </Badge>
                            {result.result_type === 'social_media' && result.social_media_analysis && (
                              <Badge 
                                variant={result.social_media_analysis.authenticity_status === 'Verified' ? 'default' : 'outline'} 
                                className="text-xs"
                              >
                                {result.social_media_analysis.platform}
                              </Badge>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Badge variant="outline" className="text-xs">
                              Confidence: {Math.round(result.confidence_score * 100)}%
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Relevance: {Math.round(result.relevance_score * 100)}%
                            </Badge>
                            {result.result_type === 'social_media' && result.social_media_analysis?.risk_level && 
                              getRiskLevelBadge(result.social_media_analysis.risk_level)
                            }
                            {result.result_type === 'fraud_analysis' && result.fraud_risk_score && 
                              getRiskLevelBadge(undefined, result.fraud_risk_score)
                            }
                          </div>
                        </div>

                        <h4 className="font-semibold text-foreground mb-2 flex items-center">
                          {result.title}
                          {result.source_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-2 h-auto p-1"
                              onClick={() => window.open(result.source_url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </h4>

                        {result.description && (
                          <p className="text-muted-foreground mb-3 text-sm">
                            {result.description}
                          </p>
                        )}

                        {result.content && (
                          <div className="bg-muted/30 rounded p-3 text-sm">
                            <p className="whitespace-pre-wrap">{result.content}</p>
                            
                            {/* Show fraud indicators for fraud analysis results */}
                            {result.result_type === 'fraud_analysis' && result.fake_profile_indicators && 
                              getFraudIndicators(result.fake_profile_indicators)
                            }
                            
                            {/* Show social media analysis details */}
                            {result.result_type === 'social_media' && result.social_media_analysis && (
                              <div className="mt-3 pt-3 border-t border-border/50">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="font-medium">Platform:</span> {result.social_media_analysis.platform}
                                  </div>
                                  <div>
                                    <span className="font-medium">Status:</span> {result.social_media_analysis.authenticity_status}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Display real images if available */}
                        {(result.image_urls && result.image_urls.length > 0) && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              {result.result_type === 'image_analysis' ? 'Analyzed Image:' : 'Related Images:'}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {result.image_urls.slice(0, 4).map((imageUrl: string, imgIndex: number) => (
                                <div key={imgIndex} className="relative group">
                                  <img 
                                    src={imageUrl} 
                                    alt={`Related to ${result.title}`}
                                    className="w-full h-20 object-cover rounded border hover:scale-105 transition-transform cursor-pointer"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                    onClick={() => window.open(imageUrl, '_blank')}
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded transition-colors flex items-center justify-center">
                                    <ExternalLink className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Show no images message for image analysis results without valid images */}
                        {result.result_type === 'image_analysis' && (!result.image_urls || result.image_urls.length === 0) && (
                          <div className="mt-3 text-xs text-muted-foreground">
                            Image analysis completed - original image not accessible
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Search History Sidebar */}
          <div>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Search History</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchSearchHistory}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {searchHistory.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">
                      No search history yet
                    </p>
                  ) : (
                    searchHistory.map((search) => (
                      <div key={search.id} className="border rounded p-3 group hover:shadow-card transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {search.search_type}
                            </Badge>
                            {getStatusIcon(search.search_status)}
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => viewSearchResults(search.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Results
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => deleteSearch(search.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Search
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {search.search_query && (
                          <p className="text-sm font-medium mb-1 line-clamp-2">
                            {search.search_query}
                          </p>
                        )}
                        
                        <p className="text-xs text-muted-foreground">
                          {new Date(search.created_at).toLocaleDateString()} at {new Date(search.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </AppLayout>
  );
};

export default DeepSearchPage;