import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Server, 
  Database, 
  Shield, 
  Mail, 
  Globe, 
  Settings,
  Key,
  Clock,
  AlertTriangle,
  CheckCircle,
  Save,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from './AppLayout';

const AdminSystemConfiguration = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [configs, setConfigs] = useState({
    general: {
      system_name: 'HarmonyShield Security Platform',
      maintenance_mode: false,
      max_users: 10000,
      session_timeout: 3600,
      rate_limit_requests: 1000,
      rate_limit_window: 3600,
      default_user_role: 'user'
    },
    security: {
      password_min_length: 8,
      require_2fa: false,
      session_security: true,
      ip_whitelist_enabled: false,
      failed_login_attempts: 5,
      lockout_duration: 900,
      jwt_expiry: 86400
    },
    email: {
      smtp_enabled: true,
      smtp_host: 'smtp.resend.com',
      smtp_port: 587,
      smtp_secure: true,
      from_email: 'noreply@harmonyshield.com',
      from_name: 'HarmonyShield Security'
    },
    api: {
      rate_limiting: true,
      api_versioning: true,
      request_logging: true,
      cors_enabled: true,
      allowed_origins: '*',
      api_timeout: 30000
    },
    monitoring: {
      error_tracking: true,
      performance_monitoring: true,
      user_analytics: true,
      system_alerts: true,
      log_retention_days: 90,
      backup_frequency: 'daily'
    }
  });

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    setLoading(true);
    try {
      // In a real app, you'd load these from a configurations table
      // For now, we'll use the default values above
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error loading configurations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load system configurations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (section: string, key: string, value: any) => {
    setConfigs(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const saveConfigurations = async () => {
    setSaving(true);
    try {
      // In a real app, you'd save these to a configurations table
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Success',
        description: 'System configurations saved successfully'
      });
    } catch (error) {
      console.error('Error saving configurations:', error);
      toast({
        title: 'Error',
        description: 'Failed to save configurations',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (service: string) => {
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Connection Test',
        description: `${service} connection successful`,
      });
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: `Failed to connect to ${service}`,
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              System Configuration
            </h1>
            <p className="text-muted-foreground">
              Configure system settings and parameters
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={loadConfigurations} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={saveConfigurations} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="system_name">System Name</Label>
                    <Input
                      id="system_name"
                      value={configs.general.system_name}
                      onChange={(e) => updateConfig('general', 'system_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_users">Maximum Users</Label>
                    <Input
                      id="max_users"
                      type="number"
                      value={configs.general.max_users}
                      onChange={(e) => updateConfig('general', 'max_users', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="session_timeout">Session Timeout (seconds)</Label>
                    <Input
                      id="session_timeout"
                      type="number"
                      value={configs.general.session_timeout}
                      onChange={(e) => updateConfig('general', 'session_timeout', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default_role">Default User Role</Label>
                    <Select 
                      value={configs.general.default_user_role} 
                      onValueChange={(value) => updateConfig('general', 'default_user_role', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Put system in maintenance mode for updates
                    </p>
                  </div>
                  <Switch
                    checked={configs.general.maintenance_mode}
                    onCheckedChange={(checked) => updateConfig('general', 'maintenance_mode', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pwd_min_length">Minimum Password Length</Label>
                    <Input
                      id="pwd_min_length"
                      type="number"
                      min="6"
                      max="20"
                      value={configs.security.password_min_length}
                      onChange={(e) => updateConfig('security', 'password_min_length', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="failed_attempts">Failed Login Attempts</Label>
                    <Input
                      id="failed_attempts"
                      type="number"
                      value={configs.security.failed_login_attempts}
                      onChange={(e) => updateConfig('security', 'failed_login_attempts', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lockout_duration">Lockout Duration (seconds)</Label>
                    <Input
                      id="lockout_duration"
                      type="number"
                      value={configs.security.lockout_duration}
                      onChange={(e) => updateConfig('security', 'lockout_duration', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jwt_expiry">JWT Token Expiry (seconds)</Label>
                    <Input
                      id="jwt_expiry"
                      type="number"
                      value={configs.security.jwt_expiry}
                      onChange={(e) => updateConfig('security', 'jwt_expiry', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Force all users to enable 2FA
                      </p>
                    </div>
                    <Switch
                      checked={configs.security.require_2fa}
                      onCheckedChange={(checked) => updateConfig('security', 'require_2fa', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enhanced Session Security</Label>
                      <p className="text-sm text-muted-foreground">
                        Additional session validation checks
                      </p>
                    </div>
                    <Switch
                      checked={configs.security.session_security}
                      onCheckedChange={(checked) => updateConfig('security', 'session_security', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>IP Whitelist</Label>
                      <p className="text-sm text-muted-foreground">
                        Restrict access to specific IP addresses
                      </p>
                    </div>
                    <Switch
                      checked={configs.security.ip_whitelist_enabled}
                      onCheckedChange={(checked) => updateConfig('security', 'ip_whitelist_enabled', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp_host">SMTP Host</Label>
                    <Input
                      id="smtp_host"
                      value={configs.email.smtp_host}
                      onChange={(e) => updateConfig('email', 'smtp_host', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp_port">SMTP Port</Label>
                    <Input
                      id="smtp_port"
                      type="number"
                      value={configs.email.smtp_port}
                      onChange={(e) => updateConfig('email', 'smtp_port', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from_email">From Email</Label>
                    <Input
                      id="from_email"
                      type="email"
                      value={configs.email.from_email}
                      onChange={(e) => updateConfig('email', 'from_email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="from_name">From Name</Label>
                    <Input
                      id="from_name"
                      value={configs.email.from_name}
                      onChange={(e) => updateConfig('email', 'from_name', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable SMTP</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable email sending via SMTP
                    </p>
                  </div>
                  <Switch
                    checked={configs.email.smtp_enabled}
                    onCheckedChange={(checked) => updateConfig('email', 'smtp_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Use Secure Connection</Label>
                    <p className="text-sm text-muted-foreground">
                      Use TLS/SSL for SMTP connection
                    </p>
                  </div>
                  <Switch
                    checked={configs.email.smtp_secure}
                    onCheckedChange={(checked) => updateConfig('email', 'smtp_secure', checked)}
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={() => testConnection('SMTP')}
                  className="w-full"
                >
                  Test Email Connection
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  API Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="api_timeout">API Timeout (ms)</Label>
                    <Input
                      id="api_timeout"
                      type="number"
                      value={configs.api.api_timeout}
                      onChange={(e) => updateConfig('api', 'api_timeout', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allowed_origins">Allowed Origins</Label>
                    <Input
                      id="allowed_origins"
                      value={configs.api.allowed_origins}
                      onChange={(e) => updateConfig('api', 'allowed_origins', e.target.value)}
                      placeholder="* or comma-separated domains"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Rate Limiting</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable API rate limiting
                      </p>
                    </div>
                    <Switch
                      checked={configs.api.rate_limiting}
                      onCheckedChange={(checked) => updateConfig('api', 'rate_limiting', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>API Versioning</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable API version headers
                      </p>
                    </div>
                    <Switch
                      checked={configs.api.api_versioning}
                      onCheckedChange={(checked) => updateConfig('api', 'api_versioning', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Request Logging</Label>
                      <p className="text-sm text-muted-foreground">
                        Log all API requests
                      </p>
                    </div>
                    <Switch
                      checked={configs.api.request_logging}
                      onCheckedChange={(checked) => updateConfig('api', 'request_logging', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>CORS Enabled</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable Cross-Origin Resource Sharing
                      </p>
                    </div>
                    <Switch
                      checked={configs.api.cors_enabled}
                      onCheckedChange={(checked) => updateConfig('api', 'cors_enabled', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Monitoring & Logging
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="log_retention">Log Retention (days)</Label>
                    <Input
                      id="log_retention"
                      type="number"
                      value={configs.monitoring.log_retention_days}
                      onChange={(e) => updateConfig('monitoring', 'log_retention_days', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backup_frequency">Backup Frequency</Label>
                    <Select 
                      value={configs.monitoring.backup_frequency} 
                      onValueChange={(value) => updateConfig('monitoring', 'backup_frequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Error Tracking</Label>
                      <p className="text-sm text-muted-foreground">
                        Track application errors and exceptions
                      </p>
                    </div>
                    <Switch
                      checked={configs.monitoring.error_tracking}
                      onCheckedChange={(checked) => updateConfig('monitoring', 'error_tracking', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Performance Monitoring</Label>
                      <p className="text-sm text-muted-foreground">
                        Monitor system performance metrics
                      </p>
                    </div>
                    <Switch
                      checked={configs.monitoring.performance_monitoring}
                      onCheckedChange={(checked) => updateConfig('monitoring', 'performance_monitoring', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>User Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Collect user behavior analytics
                      </p>
                    </div>
                    <Switch
                      checked={configs.monitoring.user_analytics}
                      onCheckedChange={(checked) => updateConfig('monitoring', 'user_analytics', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>System Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable system status alerts
                      </p>
                    </div>
                    <Switch
                      checked={configs.monitoring.system_alerts}
                      onCheckedChange={(checked) => updateConfig('monitoring', 'system_alerts', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminSystemConfiguration;