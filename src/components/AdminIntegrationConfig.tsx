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
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings,
  Key,
  Globe,
  Zap,
  Shield,
  Monitor,
  Activity,
  Database,
  Cloud,
  Lock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Copy,
  Server,
  Wifi,
  Code,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface APIKey {
  id: string;
  name: string;
  service: string;
  status: 'active' | 'inactive' | 'expired';
  lastUsed: string;
  requestsToday: number;
  rateLimit: number;
  expiresAt?: string;
  environment: 'production' | 'staging' | 'development';
}

interface EdgeFunction {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  runtime: string;
  lastDeployed: string;
  invocations24h: number;
  avgExecutionTime: number;
  errorRate: number;
  memoryUsage: number;
}

interface WebSocketConnection {
  id: string;
  name: string;
  endpoint: string;
  status: 'connected' | 'disconnected' | 'error';
  connectedClients: number;
  messagesPerSecond: number;
  uptime: string;
  lastHeartbeat: string;
}

interface Integration {
  id: string;
  name: string;
  type: 'webhook' | 'api' | 'oauth' | 'database';
  status: 'active' | 'inactive' | 'error';
  endpoint: string;
  lastSync: string;
  successRate: number;
}

export function AdminIntegrationConfig() {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'OpenAI API Key',
      service: 'OpenAI',
      status: 'active',
      lastUsed: '2024-01-15T10:30:00Z',
      requestsToday: 1250,
      rateLimit: 10000,
      environment: 'production'
    },
    {
      id: '2',
      name: 'VirusTotal API',
      service: 'VirusTotal',
      status: 'active',
      lastUsed: '2024-01-15T09:15:00Z',
      requestsToday: 450,
      rateLimit: 1000,
      environment: 'production'
    },
    {
      id: '3',
      name: 'Resend Email API',
      service: 'Resend',
      status: 'active',
      lastUsed: '2024-01-15T08:45:00Z',
      requestsToday: 89,
      rateLimit: 5000,
      environment: 'production'
    }
  ]);

  const [edgeFunctions, setEdgeFunctions] = useState<EdgeFunction[]>([
    {
      id: '1',
      name: 'ai-security-chat',
      status: 'active',
      runtime: 'Deno 1.40.0',
      lastDeployed: '2024-01-15T10:00:00Z',
      invocations24h: 3420,
      avgExecutionTime: 145,
      errorRate: 0.2,
      memoryUsage: 45
    },
    {
      id: '2',
      name: 'url-scanner',
      status: 'active',
      runtime: 'Deno 1.40.0',
      lastDeployed: '2024-01-14T16:30:00Z',
      invocations24h: 1890,
      avgExecutionTime: 890,
      errorRate: 1.1,
      memoryUsage: 78
    },
    {
      id: '3',
      name: 'deep-search',
      status: 'error',
      runtime: 'Deno 1.40.0',
      lastDeployed: '2024-01-13T14:20:00Z',
      invocations24h: 245,
      avgExecutionTime: 2340,
      errorRate: 15.8,
      memoryUsage: 120
    }
  ]);

  const [websockets, setWebsockets] = useState<WebSocketConnection[]>([
    {
      id: '1',
      name: 'Real-time Analytics',
      endpoint: 'wss://api.harmonyshield.com/analytics',
      status: 'connected',
      connectedClients: 156,
      messagesPerSecond: 23.5,
      uptime: '99.8%',
      lastHeartbeat: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'Notification Hub',
      endpoint: 'wss://api.harmonyshield.com/notifications',
      status: 'connected',
      connectedClients: 89,
      messagesPerSecond: 12.1,
      uptime: '99.9%',
      lastHeartbeat: '2024-01-15T10:29:45Z'
    }
  ]);

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'Stripe Webhook',
      type: 'webhook',
      status: 'active',
      endpoint: 'https://api.harmonyshield.com/webhooks/stripe',
      lastSync: '2024-01-15T10:25:00Z',
      successRate: 99.5
    },
    {
      id: '2',
      name: 'Threat Intelligence Feed',
      type: 'api',
      status: 'active',
      endpoint: 'https://feeds.threatintel.com/api/v1',
      lastSync: '2024-01-15T10:20:00Z',
      successRate: 98.2
    }
  ]);

  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const [isAddingApiKey, setIsAddingApiKey] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState<EdgeFunction | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Error
        </Badge>;
      case 'inactive':
      case 'disconnected':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          <XCircle className="h-3 w-3 mr-1" />
          Inactive
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "API key has been copied to your clipboard.",
    });
  };

  const regenerateApiKey = async (keyId: string) => {
    toast({
      title: "Regenerating API key",
      description: "This will invalidate the current key...",
    });
    
    setTimeout(() => {
      toast({
        title: "API key regenerated",
        description: "New API key has been generated successfully.",
      });
    }, 2000);
  };

  const restartFunction = async (functionId: string) => {
    toast({
      title: "Restarting function",
      description: "Edge function is being restarted...",
    });
    
    setTimeout(() => {
      setEdgeFunctions(prev => prev.map(fn => 
        fn.id === functionId 
          ? { ...fn, status: 'active' as const, errorRate: 0 }
          : fn
      ));
      toast({
        title: "Function restarted",
        description: "Edge function is now running normally.",
      });
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integration & API Configuration</h1>
          <p className="text-muted-foreground">
            Manage third-party services, API keys, edge functions, and system integrations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            Security Audit
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      <Tabs defaultValue="api-keys" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="edge-functions">Edge Functions</TabsTrigger>
          <TabsTrigger value="websockets">WebSockets</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-6">
          {/* API Keys Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{apiKeys.filter(k => k.status === 'active').length}</div>
                <p className="text-xs text-muted-foreground">
                  of {apiKeys.length} total keys
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Requests Today</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {apiKeys.reduce((sum, key) => sum + key.requestsToday, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  across all services
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rate Limit Usage</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((apiKeys.reduce((sum, key) => sum + (key.requestsToday / key.rateLimit), 0) / apiKeys.length) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  average utilization
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">2</div>
                <p className="text-xs text-muted-foreground">
                  keys expire in 30 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* API Keys Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>API Keys Management</CardTitle>
                  <CardDescription>
                    Monitor and manage API keys for external services
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddingApiKey(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add API Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Environment</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.service}</TableCell>
                      <TableCell>{key.name}</TableCell>
                      <TableCell>{getStatusBadge(key.status)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {key.requestsToday.toLocaleString()} / {key.rateLimit.toLocaleString()}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-blue-600 h-1 rounded-full" 
                              style={{ width: `${(key.requestsToday / key.rateLimit) * 100}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={key.environment === 'production' ? 'default' : 'secondary'}>
                          {key.environment}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(key.lastUsed).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowApiKey(showApiKey === key.id ? null : key.id)}
                          >
                            {showApiKey === key.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(`sk-${key.id}...${key.service.toLowerCase()}`)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => regenerateApiKey(key.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
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

        <TabsContent value="edge-functions" className="space-y-6">
          {/* Edge Functions Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Functions</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{edgeFunctions.filter(f => f.status === 'active').length}</div>
                <p className="text-xs text-muted-foreground">
                  of {edgeFunctions.length} deployed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Invocations (24h)</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {edgeFunctions.reduce((sum, fn) => sum + fn.invocations24h, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  total requests
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Execution Time</CardTitle>
                <Monitor className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(edgeFunctions.reduce((sum, fn) => sum + fn.avgExecutionTime, 0) / edgeFunctions.length)}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  across all functions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {(edgeFunctions.reduce((sum, fn) => sum + fn.errorRate, 0) / edgeFunctions.length).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  average error rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Edge Functions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Edge Functions</CardTitle>
              <CardDescription>
                Monitor and manage deployed edge functions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Function Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Runtime</TableHead>
                    <TableHead>Invocations (24h)</TableHead>
                    <TableHead>Avg Execution</TableHead>
                    <TableHead>Error Rate</TableHead>
                    <TableHead>Memory</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {edgeFunctions.map((func) => (
                    <TableRow key={func.id}>
                      <TableCell className="font-medium">{func.name}</TableCell>
                      <TableCell>{getStatusBadge(func.status)}</TableCell>
                      <TableCell className="text-sm">{func.runtime}</TableCell>
                      <TableCell>{func.invocations24h.toLocaleString()}</TableCell>
                      <TableCell>{func.avgExecutionTime}ms</TableCell>
                      <TableCell>
                        <span className={func.errorRate > 5 ? 'text-red-600' : 'text-green-600'}>
                          {func.errorRate}%
                        </span>
                      </TableCell>
                      <TableCell>{func.memoryUsage}MB</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFunction(func)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => restartFunction(func.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
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

        <TabsContent value="websockets" className="space-y-6">
          {/* WebSocket Connections */}
          <Card>
            <CardHeader>
              <CardTitle>WebSocket Connections</CardTitle>
              <CardDescription>
                Monitor real-time WebSocket connections and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Connection Name</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Connected Clients</TableHead>
                    <TableHead>Messages/sec</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead>Last Heartbeat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {websockets.map((ws) => (
                    <TableRow key={ws.id}>
                      <TableCell className="font-medium">{ws.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{ws.endpoint}</TableCell>
                      <TableCell>{getStatusBadge(ws.status)}</TableCell>
                      <TableCell>{ws.connectedClients}</TableCell>
                      <TableCell>{ws.messagesPerSecond}</TableCell>
                      <TableCell className="text-green-600">{ws.uptime}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(ws.lastHeartbeat).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          {/* External Integrations */}
          <Card>
            <CardHeader>
              <CardTitle>External Integrations</CardTitle>
              <CardDescription>
                Manage webhooks, APIs, and third-party service integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Integration Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {integrations.map((integration) => (
                    <TableRow key={integration.id}>
                      <TableCell className="font-medium">{integration.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{integration.type}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(integration.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {integration.endpoint}
                      </TableCell>
                      <TableCell className="text-green-600">{integration.successRate}%</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(integration.lastSync).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <RefreshCw className="h-4 w-4" />
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

        <TabsContent value="security" className="space-y-6">
          {/* Security Settings */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>IP Whitelisting</CardTitle>
                <CardDescription>Restrict admin access to specific IP addresses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable IP Whitelisting</Label>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label>Allowed IP Addresses</Label>
                  <div className="space-y-2">
                    <Input placeholder="192.168.1.100" />
                    <Input placeholder="203.0.113.0/24" />
                    <Input placeholder="10.0.0.0/8" />
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add IP Range
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Security</CardTitle>
                <CardDescription>Configure API access and security policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Require API Key Authentication</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Rate Limiting</Label>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label>Max Requests per Hour</Label>
                  <Input defaultValue="10000" type="number" />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Enable CORS Protection</Label>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Edge Function Security</CardTitle>
                <CardDescription>Configure security for edge functions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>JWT Verification</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>HTTPS Only</Label>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label>Execution Timeout (seconds)</Label>
                  <Input defaultValue="30" type="number" />
                </div>
                <div className="space-y-2">
                  <Label>Memory Limit (MB)</Label>
                  <Input defaultValue="512" type="number" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>WebSocket Security</CardTitle>
                <CardDescription>Configure WebSocket connection security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Origin Validation</Label>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label>Allowed Origins</Label>
                  <Textarea 
                    placeholder="https://harmonyshield.com&#10;https://app.harmonyshield.com"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Connections per IP</Label>
                  <Input defaultValue="10" type="number" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add API Key Dialog */}
      <Dialog open={isAddingApiKey} onOpenChange={setIsAddingApiKey}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New API Key</DialogTitle>
            <DialogDescription>
              Configure a new API key for external service integration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service">Service</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="virustotal">VirusTotal</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="resend">Resend</SelectItem>
                  <SelectItem value="custom">Custom Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Key Name</Label>
              <Input id="name" placeholder="Production API Key" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key">API Key</Label>
              <Input id="key" type="password" placeholder="sk-..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingApiKey(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddingApiKey(false)}>
                Add API Key
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Function Details Dialog */}
      {selectedFunction && (
        <Dialog open={!!selectedFunction} onOpenChange={() => setSelectedFunction(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                {selectedFunction.name} Function Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <div className="pt-2">
                    {getStatusBadge(selectedFunction.status)}
                  </div>
                </div>
                <div>
                  <Label>Runtime</Label>
                  <Input value={selectedFunction.runtime} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Invocations (24h)</Label>
                  <Input value={selectedFunction.invocations24h.toLocaleString()} readOnly />
                </div>
                <div>
                  <Label>Avg Execution Time</Label>
                  <Input value={`${selectedFunction.avgExecutionTime}ms`} readOnly />
                </div>
                <div>
                  <Label>Error Rate</Label>
                  <Input value={`${selectedFunction.errorRate}%`} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Memory Usage</Label>
                  <Input value={`${selectedFunction.memoryUsage}MB`} readOnly />
                </div>
                <div>
                  <Label>Last Deployed</Label>
                  <Input value={new Date(selectedFunction.lastDeployed).toLocaleString()} readOnly />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}