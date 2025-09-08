import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Link2, 
  Copy, 
  Eye, 
  MapPin, 
  Monitor, 
  Smartphone,
  Globe,
  Calendar,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';

interface TrackingLink {
  id: string;
  title: string;
  description?: string;
  target_url: string;
  short_code: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  tracking_url?: string;
}

interface VisitorData {
  id: string;
  ip_address?: string | null;
  user_agent?: string | null;
  browser_info?: any;
  location_data?: any;
  device_info?: any;
  referer?: string | null;
  visited_at: string;
  fingerprint_hash?: string | null;
}

const AILinksPage = () => {
  const [trackingLinks, setTrackingLinks] = useState<TrackingLink[]>([]);
  const [visitorData, setVisitorData] = useState<{ [key: string]: VisitorData[] }>({});
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_url: 'https://harmonyshield.com',
    expires_at: '',
  });

  useEffect(() => {
    fetchTrackingLinks();
  }, []);

  const fetchTrackingLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('tracking_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const linksWithUrls = data.map(link => ({
        ...link,
        tracking_url: `${window.location.origin}/track/${link.short_code}`
      }));

      setTrackingLinks(linksWithUrls);
      
      // Fetch visitor data for each link
      for (const link of data) {
        await fetchVisitorData(link.id);
      }
    } catch (error) {
      console.error('Error fetching tracking links:', error);
      toast.error('Failed to load tracking links');
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitorData = async (trackingLinkId: string) => {
    try {
      const { data, error } = await supabase
        .from('visitor_data')
        .select('*')
        .eq('tracking_link_id', trackingLinkId)
        .order('visited_at', { ascending: false });

      if (error) throw error;

      setVisitorData(prev => ({
        ...prev,
        [trackingLinkId]: (data || []) as VisitorData[]
      }));
    } catch (error) {
      console.error('Error fetching visitor data:', error);
    }
  };

  const createTrackingLink = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-tracking-link', {
        body: formData
      });

      if (error) throw error;

      toast.success('Tracking link created successfully!');
      setCreateModalOpen(false);
      setFormData({
        title: '',
        description: '',
        target_url: 'https://harmonyshield.com',
        expires_at: '',
      });
      fetchTrackingLinks();
    } catch (error) {
      console.error('Error creating tracking link:', error);
      toast.error('Failed to create tracking link');
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const toggleLinkStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tracking_links')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Link ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchTrackingLinks();
    } catch (error) {
      console.error('Error updating link status:', error);
      toast.error('Failed to update link status');
    }
  };

  const deleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tracking_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Tracking link deleted');
      fetchTrackingLinks();
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error('Failed to delete link');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Links</h1>
            <p className="text-muted-foreground mt-2">
              Create tracking links to capture visitor information and identify potential scammers
            </p>
          </div>
          
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Tracking Link</DialogTitle>
                <DialogDescription>
                  Generate a new tracking link to capture visitor information
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Dating Profile Verification"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the purpose of this link"
                  />
                </div>
                
                <div>
                  <Label htmlFor="target_url">Redirect URL</Label>
                  <Input
                    id="target_url"
                    value={formData.target_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_url: e.target.value }))}
                    placeholder="https://harmonyshield.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                  />
                </div>
              </div>
              
              <Button onClick={createTrackingLink} className="w-full">
                Create Tracking Link
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="links" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="links">My Links ({trackingLinks.length})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="links" className="space-y-4">
            {trackingLinks.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Link2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tracking links yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first tracking link to start capturing visitor data
                  </p>
                  <Button onClick={() => setCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Link
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {trackingLinks.map((link) => {
                  const visitors = visitorData[link.id] || [];
                  const isExpired = link.expires_at && new Date(link.expires_at) < new Date();
                  
                  return (
                    <Card key={link.id} className={`${!link.is_active || isExpired ? 'opacity-60' : ''}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">{link.title}</CardTitle>
                            {link.description && (
                              <CardDescription className="mt-2">{link.description}</CardDescription>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={link.is_active && !isExpired ? 'default' : 'secondary'}>
                              {isExpired ? 'Expired' : link.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              {visitors.length} visits
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <Link2 className="h-4 w-4 text-muted-foreground" />
                          <code className="flex-1 text-sm font-mono">{link.tracking_url}</code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(link.tracking_url!)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Created {new Date(link.created_at).toLocaleDateString()}
                            </span>
                            {link.expires_at && (
                              <span className="flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4" />
                                Expires {new Date(link.expires_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleLinkStatus(link.id, link.is_active)}
                            >
                              {link.is_active ? (
                                <ToggleRight className="h-4 w-4" />
                              ) : (
                                <ToggleLeft className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteLink(link.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {visitors.length > 0 && (
                          <div className="border-t pt-4">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Recent Visitors ({visitors.length})
                            </h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {visitors.slice(0, 5).map((visitor) => (
                                <div key={visitor.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                      {visitor.device_info?.type === 'mobile' ? (
                                        <Smartphone className="h-4 w-4 text-blue-500" />
                                      ) : (
                                        <Monitor className="h-4 w-4 text-green-500" />
                                      )}
                                      <span className="text-sm">
                                        {visitor.browser_info?.browser || 'Unknown'}
                                      </span>
                                    </div>
                                    {visitor.ip_address && (
                                      <div className="flex items-center gap-1">
                                        <Globe className="h-4 w-4 text-orange-500" />
                                        <span className="text-sm font-mono">{visitor.ip_address}</span>
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(visitor.visited_at).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>
                  Detailed analytics and visitor tracking data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{trackingLinks.length}</div>
                    <div className="text-sm text-muted-foreground">Total Links</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {trackingLinks.filter(l => l.is_active).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Links</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {Object.values(visitorData).flat().length}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Visits</div>
                  </div>
                </div>
                
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>Detailed analytics coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AILinksPage;