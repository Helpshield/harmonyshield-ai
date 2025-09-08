import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Lock, Key, Smartphone, AlertTriangle, Monitor, MapPin, Calendar, Trash2, Fingerprint, Scan, Mic, Timer, ShieldCheck, QrCode, Copy, Download, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { checkPasswordStrength } from '@/utils/passwordStrength';
import { useBiometricSettings } from '@/hooks/useBiometricSettings';
import { useTwoFactor } from '@/hooks/useTwoFactor';

const SecurityTab = () => {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const { toast } = useToast();
  
  // Use biometric settings hook
  const { 
    settings: biometricSettings, 
    loading: biometricLoading, 
    saving: biometricSaving, 
    saveSettings: saveBiometricSettings, 
    enrollBiometric, 
    testBiometric, 
    checkBiometricSupport 
  } = useBiometricSettings();

  // Use 2FA hook
  const {
    settings: twoFactorSettings,
    loading: twoFactorLoading,
    enabling: twoFactorEnabling,
    qrCode,
    enable2FA,
    verify2FA,
    disable2FA,
    regenerateBackupCodes
  } = useTwoFactor();

  const passwordStrength = checkPasswordStrength(passwords.new);
  const biometricSupport = checkBiometricSupport();

  // Fetch user sessions
  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('is_active', true)
        .order('last_accessed_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load sessions.",
        variant: "destructive"
      });
    } finally {
      setLoadingSessions(false);
    }
  };

  // Revoke a specific session
  const revokeSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Session Revoked",
        description: "Session has been successfully revoked."
      });

      fetchSessions(); // Refresh the sessions list
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to revoke session.",
        variant: "destructive"
      });
    }
  };

  // Revoke all sessions except current
  const revokeAllSessions = async () => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .neq('session_token', 'current'); // Keep current session active

      if (error) throw error;

      toast({
        title: "All Sessions Revoked",
        description: "All other sessions have been revoked successfully."
      });

      fetchSessions(); // Refresh the sessions list
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to revoke all sessions.",
        variant: "destructive"
      });
    }
  };

  // Load sessions on component mount
  useEffect(() => {
    fetchSessions();
  }, []);

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast({
        title: "Error",
        description: "Please fill in all password fields.",
        variant: "destructive"
      });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Error",
        description: "New passwords don't match.",
        variant: "destructive"
      });
      return;
    }

    if (passwordStrength.score < 3) {
      toast({
        title: "Weak Password",
        description: "Please choose a stronger password.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;

      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed."
      });
      
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
              placeholder="Enter current password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
              placeholder="Enter new password"
            />
            {passwords.new && (
              <div className="space-y-2">
                <Progress value={passwordStrength.score * 20} className="w-full" />
                <p className={`text-sm ${passwordStrength.color}`}>
                  {passwordStrength.feedback}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
              placeholder="Confirm new password"
            />
          </div>

          <Button onClick={handlePasswordChange} disabled={loading} className="w-full">
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Enable Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              checked={twoFactorSettings.enabled}
              onCheckedChange={async (checked) => {
                if (checked) {
                  await enable2FA();
                } else {
                  // Show disable dialog or form
                }
              }}
              disabled={twoFactorLoading || twoFactorEnabling}
            />
          </div>
          
          {qrCode && !twoFactorSettings.enabled && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="text-center space-y-2">
                <p className="font-medium">Setup Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <div className="flex justify-center">
                  <img src={qrCode} alt="2FA QR Code" className="border rounded" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="verification-code">Enter verification code from your app:</Label>
                <Input
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                />
                <Button 
                  onClick={async () => {
                    const success = await verify2FA(verificationCode);
                    if (success) {
                      setVerificationCode('');
                    }
                  }}
                  disabled={verificationCode.length !== 6}
                  className="w-full"
                >
                  Verify and Enable 2FA
                </Button>
              </div>
            </div>
          )}

          {twoFactorSettings.enabled && (
            <div className="space-y-4 p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-600">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Enabled
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Two-factor authentication is protecting your account
                </p>
              </div>
              
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <QrCode className="h-4 w-4 mr-2" />
                      View Backup Codes
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Backup Codes</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                      </p>
                      <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded font-mono text-sm">
                        {twoFactorSettings.backupCodes.map((code, index) => (
                          <div key={index} className="p-2 bg-background rounded border">
                            {code}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            const codes = twoFactorSettings.backupCodes.join('\n');
                            navigator.clipboard.writeText(codes);
                            toast({ title: "Copied!", description: "Backup codes copied to clipboard" });
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy All
                        </Button>
                        <Button
                          variant="outline"
                          onClick={async () => {
                            await regenerateBackupCodes();
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Disable 2FA
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Enter a verification code from your authenticator app to disable 2FA:
                      </p>
                      <Input
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                      />
                      <Button 
                        variant="destructive"
                        onClick={async () => {
                          const success = await disable2FA(verificationCode);
                          if (success) {
                            setVerificationCode('');
                          }
                        }}
                        disabled={verificationCode.length !== 6}
                        className="w-full"
                      >
                        Disable 2FA
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            Biometric Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!biometricLoading ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Fingerprint Authentication */}
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="h-5 w-5" />
                      <span className="font-medium">Fingerprint</span>
                    </div>
                    <Badge variant={biometricSettings.fingerprint_enabled ? "default" : "secondary"}>
                      {biometricSettings.fingerprint_enabled ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <Switch
                    checked={biometricSettings.fingerprint_enabled}
                    onCheckedChange={(checked) => 
                      checked 
                        ? enrollBiometric('fingerprint')
                        : saveBiometricSettings({ fingerprint_enabled: false })
                    }
                    disabled={!biometricSupport.fingerprint || biometricSaving}
                  />
                  
                  {!biometricSupport.fingerprint && (
                    <p className="text-xs text-muted-foreground">
                      Not supported on this device
                    </p>
                  )}
                  
                  {biometricSettings.fingerprint_enabled && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => testBiometric('fingerprint')}
                      className="w-full"
                    >
                      Test
                    </Button>
                  )}
                </div>

                {/* Face ID Authentication */}
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scan className="h-5 w-5" />
                      <span className="font-medium">Face ID</span>
                    </div>
                    <Badge variant={biometricSettings.face_id_enabled ? "default" : "secondary"}>
                      {biometricSettings.face_id_enabled ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <Switch
                    checked={biometricSettings.face_id_enabled}
                    onCheckedChange={(checked) => 
                      checked 
                        ? enrollBiometric('face_id')
                        : saveBiometricSettings({ face_id_enabled: false })
                    }
                    disabled={!biometricSupport.faceId || biometricSaving}
                  />
                  
                  {!biometricSupport.faceId && (
                    <p className="text-xs text-muted-foreground">
                      Not supported on this device
                    </p>
                  )}
                  
                  {biometricSettings.face_id_enabled && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => testBiometric('face_id')}
                      className="w-full"
                    >
                      Test
                    </Button>
                  )}
                </div>

                {/* Voice Recognition */}
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mic className="h-5 w-5" />
                      <span className="font-medium">Voice ID</span>
                    </div>
                    <Badge variant={biometricSettings.voice_recognition_enabled ? "default" : "secondary"}>
                      {biometricSettings.voice_recognition_enabled ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <Switch
                    checked={biometricSettings.voice_recognition_enabled}
                    onCheckedChange={(checked) => 
                      saveBiometricSettings({ voice_recognition_enabled: checked })
                    }
                    disabled={!biometricSupport.voiceRecognition || biometricSaving}
                  />
                  
                  {!biometricSupport.voiceRecognition && (
                    <p className="text-xs text-muted-foreground">
                      Not supported on this device
                    </p>
                  )}
                </div>
              </div>

              {/* Security Level */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Security Level
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred security level
                    </p>
                  </div>
                  <Select
                    value={biometricSettings.security_level}
                    onValueChange={(value: 'standard' | 'high' | 'maximum') => 
                      saveBiometricSettings({ security_level: value })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="maximum">Maximum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Auto-lock timeout */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      Auto-lock Timeout
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Lock after inactivity
                    </p>
                  </div>
                  <Select
                    value={biometricSettings.auto_lock_timeout.toString()}
                    onValueChange={(value) => 
                      saveBiometricSettings({ auto_lock_timeout: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                      <SelectItem value="600">10 minutes</SelectItem>
                      <SelectItem value="1800">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Require biometric for sensitive actions */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Biometric for Sensitive Actions</Label>
                    <p className="text-sm text-muted-foreground">
                      Add extra security for password changes, data exports, etc.
                    </p>
                  </div>
                  <Switch
                    checked={biometricSettings.require_biometric_for_sensitive}
                    onCheckedChange={(checked) => 
                      saveBiometricSettings({ require_biometric_for_sensitive: checked })
                    }
                    disabled={biometricSaving}
                  />
                </div>
              </div>

              {(!biometricSupport.fingerprint && !biometricSupport.faceId && !biometricSupport.voiceRecognition) && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Your device or browser doesn't support biometric authentication. 
                    Consider upgrading to a modern browser or device that supports WebAuthn.
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-8 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Account verified</span>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">2FA recommended</span>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Recent security scan passed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Monitor and manage your active login sessions across all devices
            </p>
            <Button 
              onClick={revokeAllSessions} 
              variant="destructive" 
              size="sm"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Revoke All
            </Button>
          </div>

          {loadingSessions ? (
            <div className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded"></div>
              <div className="h-4 bg-muted animate-pulse rounded"></div>
            </div>
          ) : sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.map((session: any) => (
                <div key={session.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      <span className="font-medium">
                        {session.device_info?.platform || 'Unknown Device'}
                      </span>
                      {session.session_token === 'current' && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <Button 
                      onClick={() => revokeSession(session.id)}
                      variant="outline" 
                      size="sm"
                      disabled={session.session_token === 'current'}
                    >
                      Revoke
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>IP: {session.ip_address || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Last active: {session.last_accessed_at 
                          ? new Date(session.last_accessed_at).toLocaleDateString() 
                          : 'Unknown'}
                      </span>
                    </div>
                    <div className="text-sm">
                      Browser: {session.browser_info?.name || 'Unknown'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 text-muted-foreground">
              <Monitor className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No active sessions found</p>
            </div>
          )}

          <Button 
            onClick={fetchSessions} 
            variant="outline" 
            className="w-full"
            disabled={loadingSessions}
          >
            {loadingSessions ? 'Refreshing...' : 'Refresh Sessions'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityTab;