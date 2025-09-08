import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Shield, 
  Plus, 
  AlertTriangle, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Send
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

interface ScamReport {
  id: string;
  title: string;
  description: string;
  platform?: string;
  scam_type?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewing' | 'resolved' | 'rejected';
  reported_url?: string;
  evidence_urls?: string[];
  created_at: string;
  updated_at: string;
}

const UserReportsPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [activeTab, setActiveTab] = useState('submit');
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: '',
    scam_type: '',
    severity: 'medium' as const,
    reported_url: '',
    evidence_urls: ''
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      setLoading(false);
      loadUserReports();
    };

    checkUser();
  }, [navigate]);

  const loadUserReports = async () => {
    try {
      const { data, error } = await supabase
        .from('scam_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data as ScamReport[] || []);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: "Error",
        description: "Failed to load your reports",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const evidenceUrls = formData.evidence_urls 
        ? formData.evidence_urls.split('\n').filter(url => url.trim())
        : [];

      const { error } = await supabase
        .from('scam_reports')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          platform: formData.platform || null,
          scam_type: formData.scam_type || null,
          severity: formData.severity,
          reported_url: formData.reported_url || null,
          evidence_urls: evidenceUrls.length > 0 ? evidenceUrls : null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your scam report has been submitted successfully",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        platform: '',
        scam_type: '',
        severity: 'medium',
        reported_url: '',
        evidence_urls: ''
      });

      // Refresh reports and switch to view tab
      loadUserReports();
      setActiveTab('view');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'reviewing':
        return <Badge variant="default"><Eye className="h-3 w-3 mr-1" />Reviewing</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity?: string) => {
    if (!severity) return null;
    
    switch (severity) {
      case 'low':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Low</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'high':
        return <Badge variant="default">High</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Scam Reporting Center
          </h1>
          <p className="text-muted-foreground">
            Help protect others by reporting suspicious activities and scams
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="submit" className="gap-2">
              <Plus className="h-4 w-4" />
              Submit Report
            </TabsTrigger>
            <TabsTrigger value="view" className="gap-2">
              <FileText className="h-4 w-4" />
              My Reports ({reports.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submit" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Submit a Scam Report
                </CardTitle>
                <CardDescription>
                  Provide detailed information about the suspicious activity or scam you've encountered
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Report Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Brief description of the scam"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="platform">Platform</Label>
                      <Input
                        id="platform"
                        value={formData.platform}
                        onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                        placeholder="Where did this occur? (e.g., WhatsApp, Email, Website)"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Detailed Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Provide as much detail as possible about the scam, including what happened, how you were contacted, and any suspicious behavior..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="scam_type">Scam Type</Label>
                      <Select value={formData.scam_type} onValueChange={(value) => setFormData(prev => ({ ...prev, scam_type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="phishing">Phishing</SelectItem>
                          <SelectItem value="fake_investment">Fake Investment</SelectItem>
                          <SelectItem value="romance_scam">Romance Scam</SelectItem>
                          <SelectItem value="tech_support">Tech Support Scam</SelectItem>
                          <SelectItem value="fake_website">Fake Website</SelectItem>
                          <SelectItem value="identity_theft">Identity Theft</SelectItem>
                          <SelectItem value="cryptocurrency">Cryptocurrency Scam</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="severity">Severity</Label>
                      <Select value={formData.severity} onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value as any }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reported_url">Suspicious URL</Label>
                      <Input
                        id="reported_url"
                        type="url"
                        value={formData.reported_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, reported_url: e.target.value }))}
                        placeholder="https://suspicious-website.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="evidence_urls">Evidence URLs</Label>
                    <Textarea
                      id="evidence_urls"
                      value={formData.evidence_urls}
                      onChange={(e) => setFormData(prev => ({ ...prev, evidence_urls: e.target.value }))}
                      placeholder="Add any screenshot URLs, document links, or other evidence (one per line)"
                      rows={3}
                    />
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full gap-2">
                    <Send className="h-4 w-4" />
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="view" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Your Submitted Reports</CardTitle>
                <CardDescription>Track the status of your scam reports</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{report.title}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {report.description}
                            </p>
                            {report.scam_type && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {report.scam_type}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {report.platform ? (
                            <Badge variant="secondary">{report.platform}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>{getSeverityBadge(report.severity)}</TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(report.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {reports.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">No reports submitted yet</p>
                          <Button 
                            variant="outline" 
                            className="mt-2"
                            onClick={() => setActiveTab('submit')}
                          >
                            Submit Your First Report
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default UserReportsPage;