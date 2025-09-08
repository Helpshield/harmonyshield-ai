import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Bell, Moon, Globe, Volume2, Monitor, Mail, Vibrate, Loader2, CheckCircle } from 'lucide-react';
import { usePreferences } from '@/hooks/usePreferences';

const PreferencesTab = () => {
  const { preferences, updatePreference, savePreferences, loading, saving } = usePreferences();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading preferences...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {saving && (
        <div className="fixed top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-elegant flex items-center gap-2 z-50">
          <CheckCircle className="h-4 w-4" />
          <span>Preferences auto-saved</span>
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch
              checked={preferences.notifications.email}
              onCheckedChange={(checked) => updatePreference('notifications', 'email', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
            </div>
            <Switch
              checked={preferences.notifications.push}
              onCheckedChange={(checked) => updatePreference('notifications', 'push', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Security Alerts</Label>
              <p className="text-sm text-muted-foreground">Important security notifications</p>
            </div>
            <Switch
              checked={preferences.notifications.security_alerts}
              onCheckedChange={(checked) => updatePreference('notifications', 'security_alerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Weekly Reports</Label>
              <p className="text-sm text-muted-foreground">Weekly activity summary</p>
            </div>
            <Switch
              checked={preferences.notifications.weekly_reports}
              onCheckedChange={(checked) => updatePreference('notifications', 'weekly_reports', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Display & Language
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={preferences.display.theme} onValueChange={(value) => updatePreference('display', 'theme', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={preferences.display.language} onValueChange={(value) => updatePreference('display', 'language', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select value={preferences.display.timezone} onValueChange={(value) => updatePreference('display', 'timezone', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-detect</SelectItem>
                <SelectItem value="utc">UTC</SelectItem>
                <SelectItem value="est">Eastern Time</SelectItem>
                <SelectItem value="pst">Pacific Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Alert Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive alerts even when app is closed</p>
            </div>
            <Switch
              checked={preferences.alerts.push_notifications}
              onCheckedChange={(checked) => updatePreference('alerts', 'push_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="flex items-center gap-1">
                <Vibrate className="h-4 w-4" />
                Vibration Alerts
              </Label>
              <p className="text-sm text-muted-foreground">Physical feedback for notifications</p>
            </div>
            <Switch
              checked={preferences.alerts.vibration_enabled}
              onCheckedChange={(checked) => updatePreference('alerts', 'vibration_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Sound Alerts</Label>
              <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
            </div>
            <Switch
              checked={preferences.alerts.sound_enabled}
              onCheckedChange={(checked) => updatePreference('alerts', 'sound_enabled', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Alert Volume: {preferences.alerts.volume[0]}%</Label>
            <Slider
              value={preferences.alerts.volume}
              onValueChange={(value) => updatePreference('alerts', 'volume', value)}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Alert Frequency</Label>
            <Select value={preferences.alerts.frequency} onValueChange={(value) => updatePreference('alerts', 'frequency', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="hourly">Hourly Digest</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-subtle border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Auto-Save Enabled
              </h3>
              <p className="text-sm text-muted-foreground">
                Your preferences are automatically saved as you change them. 
                {!loading && (
                  <span className="block mt-1 text-xs">
                    ✓ Synced to database and stored locally for offline access
                  </span>
                )}
              </p>
            </div>
            <Button 
              onClick={() => savePreferences(preferences)} 
              disabled={saving}
              variant="outline"
              size="sm"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Force Save'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreferencesTab;