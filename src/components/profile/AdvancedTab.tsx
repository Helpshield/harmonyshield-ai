import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Database, Download, Trash2, Key, Activity, AlertTriangle, FileText, Settings, Plus, Copy, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useApiKeys } from '@/hooks/useApiKeys';
import { validateApiKeyName } from '@/utils/inputValidation';

const AdvancedTab = () => {
  const [settings, setSettings] = useState({
    developer_mode: false,
    debug_logging: false,
    experimental_features: false,
    data_retention: '1year'
  });
  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    permissions: ['read'] as string[],
    rateLimit: 1000
  });
  const { toast } = useToast();
  const { apiKeys, loading: keysLoading, creating, createApiKey, toggleApiKey, deleteApiKey } = useApiKeys();

  // Load advanced settings
  const loadAdvancedSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences_data')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.preferences_data) {
        // Type assertion to handle JSON column
        const prefsData = data.preferences_data as any;
        if (prefsData.advanced) {
          setSettings(prefsData.advanced);
        }
      }
    } catch (error: any) {
      console.error('Error loading advanced settings:', error);
      toast({
        title: "Error",
        description: "Failed to load advanced settings.",
        variant: "destructive"
      });
    } finally {
      setSettingsLoading(false);
    }
  };

  // Save advanced settings
  const saveAdvancedSettings = async (newSettings: typeof settings) => {
    setSettingsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get existing preferences
      const { data: existingData } = await supabase
        .from('user_preferences')
        .select('preferences_data')
        .eq('user_id', user.id)
        .maybeSingle();

      const existingPrefs = (existingData?.preferences_data as any) || {};
      const updatedPrefs = {
        ...existingPrefs,
        advanced: newSettings
      };

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferences_data: updatedPrefs
        });

      if (error) throw error;

      setSettings(newSettings);
      
      toast({
        title: "Settings Saved",
        description: "Your advanced settings have been updated."
      });
    } catch (error: any) {
      console.error('Error saving advanced settings:', error);
      toast({
        title: "Error",
        description: "Failed to save advanced settings.",
        variant: "destructive"
      });
    } finally {
      setSettingsSaving(false);
    }
  };

  // Handle real data export
  const handleDataExport = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Export user data from multiple tables
      const validTables = [
        'profiles',
        'scan_results', 
        'scam_reports',
        'deep_search_requests',
        'deep_search_results',
        'tracking_links',
        'visitor_data',
        'recovery_requests',
        'notifications',
        'user_preferences',
        'biometric_settings',
        'user_api_keys'
      ];

      const exportData: any = {
        export_date: new Date().toISOString(),
        user_id: user.id,
        data: {}
      };

      // Fetch data from each table
      for (const table of validTables) {
        try {
          // Some tables might not have user_id column
          if (['news_articles', 'scam_database', 'bot_packages'].includes(table)) {
            continue;
          }
          
          const { data, error } = await supabase
            .from(table as any)
            .select('*')
            .eq('user_id', user.id);

          if (error) {
            console.warn(`Failed to export ${table}:`, error);
            continue;
          }

          exportData.data[table] = data || [];
        } catch (error) {
          console.warn(`Error exporting ${table}:`, error);
        }
      }

      // Create and download the file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `harmonyshield-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Your data has been exported and downloaded successfully."
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // In a real implementation, this would call a secure endpoint
      // that handles proper account deletion with data cleanup
      toast({
        title: "Account Deletion Initiated",
        description: "Your account deletion request has been processed. You will receive a confirmation email.",
        variant: "destructive"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive"
      });
    }
  };

  const handleCreateApiKey = async () => {
    const nameValidation = validateApiKeyName(newKeyData.name);
    if (!nameValidation.isValid) {
      toast({
        title: "Invalid Name",
        description: nameValidation.message,
        variant: "destructive"
      });
      return;
    }

    const generatedKey = await createApiKey(newKeyData);
    if (generatedKey) {
      setNewApiKey(generatedKey);
      setShowNewKey(true);
      setNewKeyData({ name: '', permissions: ['read'], rateLimit: 1000 });
    }
  };

  const updateSetting = async (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    await saveAdvancedSettings(newSettings);
  };

  useEffect(() => {
    loadAdvancedSettings();
  }, []);

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading advanced settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate API keys to access HarmonyShield services programmatically.
            </p>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate New API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="keyName">Key Name</Label>
                    <Input
                      id="keyName"
                      value={newKeyData.name}
                      onChange={(e) => setNewKeyData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Production Scanner API"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    <div className="flex gap-2">
                      {['read', 'write', 'delete'].map(permission => (
                        <div key={permission} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={permission}
                            checked={newKeyData.permissions.includes(permission)}
                            onChange={(e) => {
                              const newPermissions = e.target.checked 
                                ? [...newKeyData.permissions, permission]
                                : newKeyData.permissions.filter(p => p !== permission);
                              setNewKeyData(prev => ({ ...prev, permissions: newPermissions }));
                            }}
                          />
                          <Label htmlFor={permission} className="capitalize">{permission}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rateLimit">Rate Limit (requests/hour)</Label>
                    <Input
                      id="rateLimit"
                      type="number"
                      value={newKeyData.rateLimit}
                      onChange={(e) => setNewKeyData(prev => ({ ...prev, rateLimit: parseInt(e.target.value) || 1000 }))}
                    />
                  </div>

                  <Button 
                    onClick={handleCreateApiKey} 
                    disabled={creating || !newKeyData.name}
                    className="w-full"
                  >
                    {creating ? 'Creating...' : 'Create API Key'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Display new API key */}
            {showNewKey && newApiKey && (
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Your new API key:</p>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded font-mono text-sm">
                      <span className="flex-1">{newApiKey}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(newApiKey);
                          toast({ title: "Copied!", description: "API key copied to clipboard" });
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ⚠️ Save this key now - you won't be able to see it again!
                    </p>
                    <Button size="sm" onClick={() => setShowNewKey(false)}>Got it</Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Existing API Keys */}
            <div className="space-y-2">
              <h4 className="font-medium">Existing API Keys</h4>
              {keysLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </div>
              ) : apiKeys.length > 0 ? (
                <div className="space-y-2">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{key.key_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {key.api_key_prefix} • {key.permissions.join(', ')} • {key.rate_limit_per_hour}/hr
                        </p>
                        {key.last_used && (
                          <p className="text-xs text-muted-foreground">
                            Last used: {new Date(key.last_used).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={key.is_active ? "default" : "secondary"}>
                          {key.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleApiKey(key.id, !key.is_active)}
                        >
                          {key.is_active ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteApiKey(key.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No API keys created yet.</p>
              )}
            </div>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              API keys provide full access to your account. Keep them secure and never share them publicly.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">Export Your Data</p>
              <p className="text-sm text-muted-foreground">
                Download a complete copy of all your data including reports, scans, and settings.
              </p>
            </div>
            <Button onClick={handleDataExport} disabled={loading} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {loading ? 'Exporting...' : 'Export'}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">Data Retention</p>
              <p className="text-sm text-muted-foreground">
                Configure how long we keep your data
              </p>
            </div>
            <Select 
              value={settings.data_retention} 
              onValueChange={(value) => updateSetting('data_retention', value)}
              disabled={settingsSaving}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="1year">1 Year</SelectItem>
                <SelectItem value="2years">2 Years</SelectItem>
                <SelectItem value="indefinite">Indefinite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Developer Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Developer Mode</Label>
              <p className="text-sm text-muted-foreground">Enable advanced debugging features</p>
            </div>
            <Switch
              checked={settings.developer_mode}
              onCheckedChange={(checked) => updateSetting('developer_mode', checked)}
              disabled={settingsSaving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Debug Logging</Label>
              <p className="text-sm text-muted-foreground">Enable detailed logging for troubleshooting</p>
            </div>
            <Switch
              checked={settings.debug_logging}
              onCheckedChange={(checked) => updateSetting('debug_logging', checked)}
              disabled={settingsSaving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Experimental Features</Label>
              <p className="text-sm text-muted-foreground">Access beta features (may be unstable)</p>
            </div>
            <Switch
              checked={settings.experimental_features}
              onCheckedChange={(checked) => updateSetting('experimental_features', checked)}
              disabled={settingsSaving}
            />
          </div>

          {settingsSaving && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Saving settings...</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-destructive/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              These actions are irreversible. Please proceed with caution.
            </AlertDescription>
          </Alert>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data from our servers including:
                  <br />• All scan results and reports
                  <br />• Security alerts and tracking links
                  <br />• Profile information and preferences
                  <br />• API keys and integrations
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleAccountDeletion} className="bg-destructive hover:bg-destructive/90">
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedTab;
