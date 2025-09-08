import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  Settings, 
  Zap, 
  Monitor,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useWebSocketAnalytics } from '@/hooks/useWebSocketAnalytics';
import { toast } from '@/hooks/use-toast';

interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  avgResponseTime: number;
  errorRate: number;
  lastUpdate: string;
}

const AdminWebSocketSettings = () => {
  const [settings, setSettings] = useState({
    enabled: true,
    maxConnections: 1000,
    heartbeatInterval: 30,
    autoReconnect: true,
    compressionEnabled: true,
    rateLimitPerSecond: 10,
    maxMessageSize: 1024,
    logLevel: 'info'
  });

  const [metrics, setMetrics] = useState<ConnectionMetrics>({
    totalConnections: 0,
    activeConnections: 0,
    avgResponseTime: 0,
    errorRate: 0,
    lastUpdate: new Date().toISOString()
  });

  const [logs, setLogs] = useState<Array<{
    id: string;
    timestamp: string;
    level: 'info' | 'warning' | 'error';
    message: string;
    connection?: string;
  }>>([]);

  const { 
    connected, 
    loading, 
    error, 
    data,
    refreshStats 
  } = useWebSocketAnalytics(['user_activity', 'scan_activity', 'ab_tests']);

  useEffect(() => {
    // Simulate metrics updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        activeConnections: Math.floor(Math.random() * 50) + 10,
        avgResponseTime: Math.floor(Math.random() * 100) + 50,
        errorRate: Math.random() * 5,
        lastUpdate: new Date().toISOString()
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simulate log entries
    const logInterval = setInterval(() => {
      const logLevels: Array<'info' | 'warning' | 'error'> = ['info', 'warning', 'error'];
      const messages = [
        'WebSocket connection established',
        'Authentication successful',
        'Rate limit exceeded for connection',
        'Connection closed by client',
        'Failed to parse message',
        'Heartbeat timeout detected'
      ];

      const newLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        level: logLevels[Math.floor(Math.random() * logLevels.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        connection: `conn_${Math.floor(Math.random() * 1000)}`
      };

      setLogs(prev => [newLog, ...prev.slice(0, 49)]);
    }, 10000);

    return () => clearInterval(logInterval);
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Setting Updated",
      description: `${key} has been updated successfully`
    });
  };

  const restartWebSocketService = () => {
    toast({
      title: "Service Restarting",
      description: "WebSocket service is being restarted..."
    });
    
    // Simulate restart
    setTimeout(() => {
      toast({
        title: "Service Restarted",
        description: "WebSocket service has been restarted successfully"
      });
    }, 3000);
  };

  const clearLogs = () => {
    setLogs([]);
    toast({
      title: "Logs Cleared",
      description: "All WebSocket logs have been cleared"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-success text-success-foreground">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="destructive">Disconnected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <CheckCircle className="h-4 w-4 text-success" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">WebSocket Configuration</h2>
          <p className="text-muted-foreground">Manage real-time connection settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Stats
          </Button>
          <Button variant="outline" onClick={restartWebSocketService}>
            <Zap className="h-4 w-4 mr-2" />
            Restart Service
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Status</CardTitle>
            {connected ? <Wifi className="h-4 w-4 text-success" /> : <WifiOff className="h-4 w-4 text-destructive" />}
          </CardHeader>
          <CardContent>
            {getStatusBadge(connected ? 'connected' : 'disconnected')}
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeConnections}</div>
            <p className="text-xs text-muted-foreground">
              Max: {settings.maxConnections}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Average latency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.errorRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Service Settings
            </CardTitle>
            <CardDescription>Configure WebSocket service parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enabled">Enable WebSocket Service</Label>
              <Switch
                id="enabled"
                checked={settings.enabled}
                onCheckedChange={(checked) => handleSettingChange('enabled', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxConnections">Max Connections</Label>
              <Input
                id="maxConnections"
                type="number"
                value={settings.maxConnections}
                onChange={(e) => handleSettingChange('maxConnections', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heartbeatInterval">Heartbeat Interval (seconds)</Label>
              <Input
                id="heartbeatInterval"
                type="number"
                value={settings.heartbeatInterval}
                onChange={(e) => handleSettingChange('heartbeatInterval', parseInt(e.target.value))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="autoReconnect">Auto Reconnect</Label>
              <Switch
                id="autoReconnect"
                checked={settings.autoReconnect}
                onCheckedChange={(checked) => handleSettingChange('autoReconnect', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="compression">Enable Compression</Label>
              <Switch
                id="compression"
                checked={settings.compressionEnabled}
                onCheckedChange={(checked) => handleSettingChange('compressionEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="h-5 w-5 mr-2" />
              Performance Settings
            </CardTitle>
            <CardDescription>Optimize WebSocket performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rateLimit">Rate Limit (per second)</Label>
              <Input
                id="rateLimit"
                type="number"
                value={settings.rateLimitPerSecond}
                onChange={(e) => handleSettingChange('rateLimitPerSecond', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxMessageSize">Max Message Size (KB)</Label>
              <Input
                id="maxMessageSize"
                type="number"
                value={settings.maxMessageSize}
                onChange={(e) => handleSettingChange('maxMessageSize', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logLevel">Log Level</Label>
              <Select 
                value={settings.logLevel} 
                onValueChange={(value) => handleSettingChange('logLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debug">Debug</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Logs */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Real-time Logs</CardTitle>
              <CardDescription>Monitor WebSocket connection activity</CardDescription>
            </div>
            <Button variant="outline" onClick={clearLogs}>
              Clear Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Level</TableHead>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="w-[120px]">Connection</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {getLogIcon(log.level)}
                        <span className="ml-2 capitalize">{log.level}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>{log.message}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.connection}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {logs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No logs available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminWebSocketSettings;