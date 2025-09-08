import React, { useState, useEffect } from 'react';
import { AppLayout } from './AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Settings,
  CheckCircle,
  Info,
  AlertCircle,
  Lock,
  Eye,
  Globe
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AlertSettings {
  threatAlerts: boolean;
  protectionTrends: boolean;
  dailyDigest: boolean;
  emergencyAlerts: boolean;
}

interface SecurityAlert {
  id: string;
  type: 'threat' | 'protection' | 'info' | 'emergency';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
}

const SecurityAlertsPage: React.FC = () => {
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    threatAlerts: true,
    protectionTrends: true,
    dailyDigest: false,
    emergencyAlerts: true,
  });
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityAlerts();
  }, []);

  const loadSecurityAlerts = async () => {
    setLoading(true);
    
    // Mock data for now - in real implementation, this would come from Supabase
    const mockAlerts: SecurityAlert[] = [
      {
        id: '1',
        type: 'threat',
        title: 'Phishing Attempt Detected',
        description: 'A suspicious email claiming to be from your bank was blocked. The email contained malicious links attempting to steal your credentials.',
        severity: 'high',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        actionRequired: true,
      },
      {
        id: '2',
        type: 'protection',
        title: 'New Protection Update Available',
        description: 'Enhanced fraud detection algorithms have been deployed to better protect against emerging crypto scams.',
        severity: 'medium',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        read: false,
        actionRequired: false,
      },
      {
        id: '3',
        type: 'info',
        title: 'Weekly Security Scan Completed',
        description: 'Your weekly security scan has been completed successfully. No threats detected across your connected accounts.',
        severity: 'low',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        actionRequired: false,
      },
      {
        id: '4',
        type: 'emergency',
        title: 'Critical: Data Breach Alert',
        description: 'A major social media platform experienced a data breach. Your account may be affected. Immediate action recommended.',
        severity: 'critical',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        read: false,
        actionRequired: true,
      },
    ];

    setAlerts(mockAlerts);
    setLoading(false);
  };

  const handleSettingChange = async (setting: keyof AlertSettings, value: boolean) => {
    setAlertSettings(prev => ({ ...prev, [setting]: value }));
    
    // In real implementation, save to Supabase
    toast({
      title: "Settings Updated",
      description: `${setting} notifications ${value ? 'enabled' : 'disabled'}`,
    });
  };

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAlertIcon = (type: string, severity: string) => {
    if (severity === 'critical' || type === 'emergency') {
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
    if (type === 'threat') {
      return <Shield className="h-5 w-5 text-orange-600" />;
    }
    if (type === 'protection') {
      return <TrendingUp className="h-5 w-5 text-blue-600" />;
    }
    return <Info className="h-5 w-5 text-gray-600" />;
  };

  const safetyInstructions = [
    {
      icon: Lock,
      title: "Enable Two-Factor Authentication",
      description: "Add an extra layer of security to all your important accounts."
    },
    {
      icon: Eye,
      title: "Verify Sender Identity",
      description: "Always verify the sender's identity before clicking links or downloading attachments."
    },
    {
      icon: Globe,
      title: "Check Website URLs",
      description: "Look for HTTPS encryption and verify domain spelling before entering sensitive information."
    },
    {
      icon: AlertCircle,
      title: "Report Suspicious Activity",
      description: "Use our reporting system to help protect the community from emerging threats."
    }
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Security Alerts</h1>
            <p className="text-muted-foreground mt-1">
              Stay informed about potential threats and protection updates
            </p>
          </div>
          <Badge variant="outline" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>{alerts.filter(a => !a.read).length} unread</span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alert Settings */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Alert Settings
                </CardTitle>
                <CardDescription>
                  Customize your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Threat Alerts</p>
                      <p className="text-sm text-muted-foreground">Real-time security warnings</p>
                    </div>
                    <Switch
                      checked={alertSettings.threatAlerts}
                      onCheckedChange={(value) => handleSettingChange('threatAlerts', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Protection Trends</p>
                      <p className="text-sm text-muted-foreground">Updates on security improvements</p>
                    </div>
                    <Switch
                      checked={alertSettings.protectionTrends}
                      onCheckedChange={(value) => handleSettingChange('protectionTrends', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Daily Digest</p>
                      <p className="text-sm text-muted-foreground">Summary of daily activity</p>
                    </div>
                    <Switch
                      checked={alertSettings.dailyDigest}
                      onCheckedChange={(value) => handleSettingChange('dailyDigest', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Emergency Alerts</p>
                      <p className="text-sm text-muted-foreground">Critical security notifications</p>
                    </div>
                    <Switch
                      checked={alertSettings.emergencyAlerts}
                      onCheckedChange={(value) => handleSettingChange('emergencyAlerts', value)}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Safety Instructions</h4>
                  <div className="space-y-3">
                    {safetyInstructions.map((instruction, index) => {
                      const Icon = instruction.icon;
                      return (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                          <Icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">{instruction.title}</p>
                            <p className="text-xs text-muted-foreground">{instruction.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Alerts Feed */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Recent Alerts
                </CardTitle>
                <CardDescription>
                  Latest security notifications and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-lg transition-all hover:shadow-sm ${
                        alert.read ? 'bg-muted/20' : 'bg-background'
                      } ${getSeverityColor(alert.severity)}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getAlertIcon(alert.type, alert.severity)}
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{alert.title}</h4>
                              {!alert.read && (
                                <div className="h-2 w-2 bg-primary rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {alert.severity.toUpperCase()}
                          </Badge>
                          {alert.actionRequired && (
                            <Badge variant="destructive" className="text-xs">
                              ACTION REQUIRED
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm mb-3">{alert.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {alert.actionRequired && (
                            <Button size="sm" variant="outline">
                              Take Action
                            </Button>
                          )}
                          {!alert.read && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => markAsRead(alert.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mark as Read
                            </Button>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {alert.type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                {alerts.length === 0 && (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mb-2">No security alerts</p>
                    <p className="text-sm text-muted-foreground">
                      You're all caught up! We'll notify you of any new security updates.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Protection Status */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Protection Status:</strong> All systems are monitoring for threats. 
            Your security alerts are active and up-to-date.
          </AlertDescription>
        </Alert>
      </div>
    </AppLayout>
  );
};

export default SecurityAlertsPage;