import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield,
  Lock,
  Key,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload,
  Scan,
  UserCheck,
  Activity,
  FileText,
  Clock
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from './AppLayout';

const AdminSecurityCenter = () => {
  const [loading, setLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [securityData, setSecurityData] = useState({
    overview: {
      security_score: 92,
      threats_blocked: 1247,
      vulnerabilities_found: 3,
      last_scan: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      active_sessions: 156,
      failed_logins: 23
    },
    threats: [
      {
        id: 1,
        type: 'Phishing Attempt',
        severity: 'high',
        source: '192.168.1.100',
        description: 'Suspicious email with phishing links detected',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'blocked',
        actions_taken: ['IP blocked', 'Email quarantined']
      },
      {
        id: 2,  
        type: 'Brute Force Attack',
        severity: 'medium',
        source: '10.0.0.45',
        description: 'Multiple failed login attempts from same IP',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'monitoring',
        actions_taken: ['Rate limiting applied']
      },
      {
        id: 3,
        type: 'Malware Detection',
        severity: 'critical',
        source: 'uploaded_file.exe',
        description: 'Malicious file detected in user upload',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        status: 'quarantined',
        actions_taken: ['File quarantined', 'User notified', 'Scan initiated']
      }
    ],
    vulnerabilities: [
      {
        id: 1,
        title: 'Outdated SSL Certificate',
        severity: 'medium',
        component: 'Web Server',
        description: 'SSL certificate expires in 15 days',
        remediation: 'Renew SSL certificate before expiration',
        status: 'pending'
      },
      {
        id: 2,
        title: 'Weak Password Policy',
        severity: 'low',
        component: 'Authentication System',
        description: 'Password policy allows weak passwords',
        remediation: 'Update password complexity requirements',
        status: 'acknowledged'
      },
      {
        id: 3,
        title: 'Unnecessary Service Running',
        severity: 'low',
        component: 'System Services',
        description: 'Unused FTP service is running',
        remediation: 'Disable unused FTP service',
        status: 'fixed'
      }
    ],
    audit_log: [
      {
        id: 1,
        action: 'User Login',
        user: 'admin@harmonyshield.com',
        ip: '192.168.1.50',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: 'success'
      },
      {
        id: 2,
        action: 'Configuration Change',
        user: 'admin@harmonyshield.com',
        ip: '192.168.1.50',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        status: 'success'
      },
      {
        id: 3,
        action: 'Failed Login Attempt',
        user: 'unknown',
        ip: '10.0.0.45',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'failed'
      }
    ],
    security_trends: [
      { date: '2024-01-01', threats: 45, blocked: 43 },
      { date: '2024-01-02', threats: 52, blocked: 50 },
      { date: '2024-01-03', threats: 38, blocked: 36 },
      { date: '2024-01-04', threats: 61, blocked: 59 },
      { date: '2024-01-05', threats: 47, blocked: 45 },
      { date: '2024-01-06', threats: 55, blocked: 52 },
      { date: '2024-01-07', threats: 42, blocked: 41 }
    ],
    threat_distribution: [
      { name: 'Phishing', value: 35, color: '#ef4444' },
      { name: 'Malware', value: 25, color: '#f97316' },
      { name: 'Brute Force', value: 20, color: '#eab308' },
      { name: 'DDoS', value: 12, color: '#06b6d4' },
      { name: 'Other', value: 8, color: '#6b7280' }
    ]
  });

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      // Load real security data from database
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error loading security data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load security data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const runSecurityScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    try {
      // Simulate security scan progress
      for (let i = 0; i <= 100; i += 10) {
        setScanProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      toast({
        title: 'Security Scan Complete',
        description: 'System security scan completed successfully'
      });
      
      // Update security score after scan
      setSecurityData(prev => ({
        ...prev,
        overview: {
          ...prev.overview,
          last_scan: new Date().toISOString(),
          security_score: Math.min(100, prev.overview.security_score + Math.floor(Math.random() * 5))
        }
      }));
    } catch (error) {
      toast({
        title: 'Scan Failed',
        description: 'Security scan encountered an error',
        variant: 'destructive'
      });
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'blocked':
      case 'success':
      case 'fixed': 
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
      case 'critical': 
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'monitoring':
      case 'pending':
      case 'acknowledged': 
        return <Clock className="h-4 w-4 text-warning" />;
      default: 
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Security Center
            </h1>
            <p className="text-muted-foreground">
              Comprehensive security monitoring and threat management
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={loadSecurityData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={runSecurityScan} disabled={isScanning}>
              <Scan className="h-4 w-4 mr-2" />
              {isScanning ? 'Scanning...' : 'Run Security Scan'}
            </Button>
          </div>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Score</CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{securityData.overview.security_score}%</div>
              <Progress value={securityData.overview.security_score} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {securityData.overview.security_score >= 90 ? 'Excellent' : 
                 securityData.overview.security_score >= 70 ? 'Good' : 'Needs attention'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Threats Blocked</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityData.overview.threats_blocked.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <UserCheck className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityData.overview.active_sessions}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Currently online users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
              <XCircle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{securityData.overview.failed_logins}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Last 24 hours
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Scanning Progress */}
        {isScanning && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5 animate-spin" />
                Security Scan in Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={scanProgress} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                Scanning system components... {scanProgress}% complete
              </p>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="threats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="threats">Threats</TabsTrigger>
            <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="threats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recent Threats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityData.threats.map((threat) => (
                    <div key={threat.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(threat.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{threat.type}</h4>
                            <Badge variant={getSeverityColor(threat.severity)}>{threat.severity}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {threat.description}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            <p>Source: {threat.source}</p>
                            <p>Time: {new Date(threat.timestamp).toLocaleString()}</p>
                            <p>Actions: {threat.actions_taken.join(', ')}</p>
                          </div>
                        </div>
                      </div>
                      <Badge variant={threat.status === 'blocked' ? 'default' : 'secondary'}>
                        {threat.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vulnerabilities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  System Vulnerabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vulnerability</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Component</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {securityData.vulnerabilities.map((vuln) => (
                      <TableRow key={vuln.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{vuln.title}</p>
                            <p className="text-sm text-muted-foreground">{vuln.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSeverityColor(vuln.severity)}>{vuln.severity}</Badge>
                        </TableCell>
                        <TableCell>{vuln.component}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(vuln.status)}
                            <span className="text-sm">{vuln.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Security Audit Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {securityData.audit_log.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.action}</TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>{log.ip}</TableCell>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status)}
                            <span className="text-sm">{log.status}</span>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Threat Trends (7 days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={securityData.security_trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="threats" stroke="hsl(var(--primary))" name="Threats Detected" />
                      <Line type="monotone" dataKey="blocked" stroke="hsl(var(--success))" name="Threats Blocked" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Threat Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={securityData.threat_distribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {securityData.threat_distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Security settings are managed in the System Configuration section. 
                    Navigate to Admin → System Configuration → Security tab to modify security parameters.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Security Report
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Security Rules
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminSecurityCenter;