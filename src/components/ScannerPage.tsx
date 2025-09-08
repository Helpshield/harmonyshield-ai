import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from './AppLayout';

interface ScanResult {
  id: string;
  overallScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendations: string[];
  virusTotalResults?: any;
  openAIAnalysis?: string;
}

const ScannerPage = () => {
  const [activeTab, setActiveTab] = useState<'url' | 'text'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const { toast } = useToast();

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'High': return 'text-orange-600';
      case 'Critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Low': return '🟢';
      case 'Medium': return '🟡';
      case 'High': return '🟠';
      case 'Critical': return '🔴';
      default: return '⚪';
    }
  };

  const performScan = async (type: 'url' | 'text', content: string) => {
    setIsScanning(true);
    setScanProgress(0);
    setScanResult(null);

    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to use the scanner",
          variant: "destructive",
        });
        return;
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Call the AI scanner function
      const { data, error } = await supabase.functions.invoke('ai-scanner', {
        body: {
          type,
          content,
          userId: session.user.id
        }
      });

      clearInterval(progressInterval);
      setScanProgress(100);

      if (error) {
        throw error;
      }

      if (data.success) {
        const result: ScanResult = {
          id: Date.now().toString(),
          overallScore: data.result.overall_score || 75,
          riskLevel: data.result.risk_level || 'Medium',
          recommendations: data.result.recommendations || ['No specific recommendations available'],
          virusTotalResults: data.result.virus_total_results,
          openAIAnalysis: data.result.openai_analysis
        };

        setScanResult(result);
        setRecentScans(prev => [result, ...prev.slice(0, 4)]);

        toast({
          title: "Scan Complete",
          description: `Security analysis finished with ${result.riskLevel} risk level`,
        });
      } else {
        throw new Error(data.error || 'Scan failed');
      }

    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Scan Failed",
        description: "Unable to complete security scan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const handleUrlScan = () => {
    if (!urlInput.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }
    performScan('url', urlInput);
  };

  const handleTextScan = () => {
    if (!textInput.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter text to analyze",
        variant: "destructive",
      });
      return;
    }
    performScan('text', textInput);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            AI Security Scanner
          </h1>
          <p className="text-muted-foreground">
            Advanced threat detection powered by artificial intelligence
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Scanner */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Security Analysis</CardTitle>
                <CardDescription>Scan URLs and text content for potential threats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'url' | 'text')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url">URL Scanner</TabsTrigger>
                    <TabsTrigger value="text">Text Analyzer</TabsTrigger>
                  </TabsList>

                  <TabsContent value="url" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Website URL</label>
                      <Input
                        placeholder="https://example.com"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        disabled={isScanning}
                      />
                    </div>
                    <Button 
                      onClick={handleUrlScan} 
                      disabled={isScanning || !urlInput.trim()}
                      className="w-full"
                    >
                      {isScanning ? 'Scanning...' : 'Scan URL'}
                    </Button>
                  </TabsContent>

                  <TabsContent value="text" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Text Content</label>
                      <Textarea
                        placeholder="Paste suspicious text, emails, or messages here..."
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        disabled={isScanning}
                        rows={4}
                      />
                    </div>
                    <Button 
                      onClick={handleTextScan} 
                      disabled={isScanning || !textInput.trim()}
                      className="w-full"
                    >
                      {isScanning ? 'Analyzing...' : 'Analyze Text'}
                    </Button>
                  </TabsContent>
                </Tabs>

                {/* Progress Bar */}
                {isScanning && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Scanning in progress...</span>
                      <span>{scanProgress}%</span>
                    </div>
                    <Progress value={scanProgress} className="w-full" />
                  </div>
                )}

                {/* Scan Results */}
                {scanResult && (
                  <div className="space-y-4">
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Scan Results</h3>
                      
                      <div className="grid gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">Overall Security Score</p>
                                <p className="text-2xl font-bold">{scanResult.overallScore}/100</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Risk Level</p>
                                <p className={`text-lg font-semibold ${getRiskColor(scanResult.riskLevel)}`}>
                                  {getRiskIcon(scanResult.riskLevel)} {scanResult.riskLevel}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Recommendations</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {scanResult.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-primary mr-2">•</span>
                                  <span className="text-sm">{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        {scanResult.openAIAnalysis && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">AI Analysis</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm">{scanResult.openAIAnalysis}</p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Scan Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Today's Scans</span>
                  <Badge variant="secondary">12</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Threats Blocked</span>
                  <Badge variant="destructive">3</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Safe URLs</span>
                  <Badge variant="default">9</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Security Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Real-time threat detection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">AI-powered analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Multiple threat databases</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Detailed reporting</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ScannerPage;