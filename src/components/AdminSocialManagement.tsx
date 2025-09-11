import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube, 
  MessageCircle,
  Settings,
  Activity,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  status: 'connected' | 'disconnected' | 'error';
  followers: number;
  lastSync: string;
  permissions: string[];
  rateLimitRemaining: number;
  rateLimitReset: string;
}

interface SocialMetrics {
  platform: string;
  posts: number;
  engagement: number;
  reach: number;
  clicks: number;
}

export function AdminSocialManagement() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<SocialAccount[]>([
    {
      id: '1',
      platform: 'Twitter',
      username: '@harmonyshield',
      status: 'connected',
      followers: 15420,
      lastSync: '2024-01-15T10:30:00Z',
      permissions: ['read', 'write', 'analytics'],
      rateLimitRemaining: 450,
      rateLimitReset: '2024-01-15T11:00:00Z'
    },
    {
      id: '2',
      platform: 'LinkedIn',
      username: 'HarmonyShield Corp',
      status: 'connected',
      followers: 8930,
      lastSync: '2024-01-15T10:25:00Z',
      permissions: ['read', 'write'],
      rateLimitRemaining: 180,
      rateLimitReset: '2024-01-15T11:15:00Z'
    },
    {
      id: '3',
      platform: 'Facebook',
      username: 'HarmonyShield',
      status: 'error',
      followers: 12350,
      lastSync: '2024-01-14T16:20:00Z',
      permissions: ['read'],
      rateLimitRemaining: 0,
      rateLimitReset: '2024-01-15T12:00:00Z'
    }
  ]);

  const [metrics, setMetrics] = useState<SocialMetrics[]>([
    { platform: 'Twitter', posts: 45, engagement: 8.2, reach: 125000, clicks: 2890 },
    { platform: 'LinkedIn', posts: 28, engagement: 12.5, reach: 89000, clicks: 1560 },
    { platform: 'Facebook', posts: 32, engagement: 6.8, reach: 156000, clicks: 3240 }
  ]);

  const [selectedAccount, setSelectedAccount] = useState<SocialAccount | null>(null);
  const [isAddingAccount, setIsAddingAccount] = useState(false);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Twitter': return <Twitter className="h-5 w-5 text-blue-500" />;
      case 'Facebook': return <Facebook className="h-5 w-5 text-blue-600" />;
      case 'Instagram': return <Instagram className="h-5 w-5 text-pink-500" />;
      case 'LinkedIn': return <Linkedin className="h-5 w-5 text-blue-700" />;
      case 'YouTube': return <Youtube className="h-5 w-5 text-red-500" />;
      default: return <MessageCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Connected
        </Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Error
        </Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          <XCircle className="h-3 w-3 mr-1" />
          Disconnected
        </Badge>;
    }
  };

  const handleRefreshAccount = async (accountId: string) => {
    toast({
      title: "Refreshing account",
      description: "Syncing latest data from social platform...",
    });
    
    // Simulate API call
    setTimeout(() => {
      setAccounts(prev => prev.map(acc => 
        acc.id === accountId 
          ? { ...acc, lastSync: new Date().toISOString(), status: 'connected' as const }
          : acc
      ));
      toast({
        title: "Account refreshed",
        description: "Successfully synced latest data.",
      });
    }, 2000);
  };

  const handleDisconnectAccount = async (accountId: string) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === accountId 
        ? { ...acc, status: 'disconnected' as const }
        : acc
    ));
    toast({
      title: "Account disconnected",
      description: "Social media account has been disconnected.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Management</h1>
          <p className="text-muted-foreground">
            Manage connected social media accounts and monitor platform activity
          </p>
        </div>
        <Dialog open={isAddingAccount} onOpenChange={setIsAddingAccount}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Connect Platform
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect Social Platform</DialogTitle>
              <DialogDescription>
                Connect a new social media platform to manage from the dashboard
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {['Twitter', 'Facebook', 'Instagram', 'LinkedIn', 'YouTube'].map((platform) => (
                  <Button key={platform} variant="outline" className="h-16 flex-col gap-2">
                    {getPlatformIcon(platform)}
                    {platform}
                  </Button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connected Platforms</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{accounts.filter(a => a.status === 'connected').length}</div>
                <p className="text-xs text-muted-foreground">
                  of {accounts.length} total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {accounts.reduce((sum, acc) => sum + acc.followers, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  across all platforms
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Rate Limits</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(accounts.reduce((sum, acc) => sum + acc.rateLimitRemaining, 0) / accounts.length)}
                </div>
                <p className="text-xs text-muted-foreground">
                  avg remaining calls
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {accounts.filter(a => a.status === 'error').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  accounts need attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Accounts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media Accounts</CardTitle>
              <CardDescription>
                Monitor and manage connected social media platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Followers</TableHead>
                    <TableHead>Rate Limit</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(account.platform)}
                          {account.platform}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{account.username}</TableCell>
                      <TableCell>{getStatusBadge(account.status)}</TableCell>
                      <TableCell>{account.followers.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {account.rateLimitRemaining}/500
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                            <div 
                              className="bg-blue-600 h-1 rounded-full" 
                              style={{ width: `${(account.rateLimitRemaining / 500) * 100}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(account.lastSync).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRefreshAccount(account.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedAccount(account)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDisconnectAccount(account.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
                <CardDescription>Engagement metrics across all platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.map((metric) => (
                    <div key={metric.platform} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getPlatformIcon(metric.platform)}
                        <div>
                          <div className="font-medium">{metric.platform}</div>
                          <div className="text-sm text-muted-foreground">{metric.posts} posts</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{metric.engagement}%</div>
                        <div className="text-sm text-muted-foreground">engagement</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reach & Clicks</CardTitle>
                <CardDescription>Content performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.map((metric) => (
                    <div key={metric.platform} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{metric.platform}</span>
                        <span className="text-sm text-muted-foreground">
                          {metric.reach.toLocaleString()} reach
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Clicks: {metric.clicks.toLocaleString()}</span>
                        <span className="text-sm">CTR: {((metric.clicks / metric.reach) * 100).toFixed(2)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(metric.clicks / metric.reach) * 100 * 20}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>Configure social media integration settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-sync">Auto-sync enabled</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically sync data from connected platforms
                    </p>
                  </div>
                  <Switch id="auto-sync" defaultChecked />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sync-interval">Sync interval</Label>
                  <Select defaultValue="15">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Every 5 minutes</SelectItem>
                      <SelectItem value="15">Every 15 minutes</SelectItem>
                      <SelectItem value="30">Every 30 minutes</SelectItem>
                      <SelectItem value="60">Every hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>IP Whitelisting</Label>
                    <p className="text-sm text-muted-foreground">
                      Restrict admin access to specific IP addresses
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="space-y-2">
                  <Label>Allowed IP Addresses</Label>
                  <div className="space-y-2">
                    <Input placeholder="192.168.1.100" />
                    <Input placeholder="203.0.113.0/24" />
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add IP Range
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for social media management
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Account Details Dialog */}
      {selectedAccount && (
        <Dialog open={!!selectedAccount} onOpenChange={() => setSelectedAccount(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getPlatformIcon(selectedAccount.platform)}
                {selectedAccount.platform} Account Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Username</Label>
                  <Input value={selectedAccount.username} readOnly />
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="pt-2">
                    {getStatusBadge(selectedAccount.status)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Followers</Label>
                  <Input value={selectedAccount.followers.toLocaleString()} readOnly />
                </div>
                <div>
                  <Label>Rate Limit</Label>
                  <Input value={`${selectedAccount.rateLimitRemaining}/500`} readOnly />
                </div>
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="flex gap-2 pt-2">
                  {selectedAccount.permissions.map((perm) => (
                    <Badge key={perm} variant="secondary">{perm}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}