import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PreferencesData {
  notifications: {
    email: boolean;
    push: boolean;
    security_alerts: boolean;
    weekly_reports: boolean;
    marketing: boolean;
  };
  display: {
    theme: string;
    language: string;
    timezone: string;
  };
  privacy: {
    analytics: boolean;
    data_sharing: boolean;
    public_profile: boolean;
  };
  alerts: {
    sound_enabled: boolean;
    volume: number[];
    frequency: string;
    vibration_enabled: boolean;
    push_notifications: boolean;
  };
}

const DEFAULT_PREFERENCES: PreferencesData = {
  notifications: {
    email: true,
    push: true,
    security_alerts: true,
    weekly_reports: false,
    marketing: false
  },
  display: {
    theme: 'system',
    language: 'en',
    timezone: 'auto'
  },
  privacy: {
    analytics: true,
    data_sharing: false,
    public_profile: false
  },
  alerts: {
    sound_enabled: true,
    volume: [75],
    frequency: 'immediate',
    vibration_enabled: true,
    push_notifications: true
  }
};

export const usePreferences = () => {
  const [preferences, setPreferences] = useState<PreferencesData>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Load preferences from database with localStorage fallback
  const loadPreferences = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Try to load from database first
        const { data, error } = await supabase
          .from('user_preferences')
          .select('preferences_data')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
          throw error;
        }

        if (data?.preferences_data) {
          setPreferences({ ...DEFAULT_PREFERENCES, ...(data.preferences_data as Partial<PreferencesData>) });
        } else {
          // Fallback to localStorage if no database record
          const localPrefs = localStorage.getItem('harmony_preferences');
          if (localPrefs) {
            const parsedPrefs = JSON.parse(localPrefs);
            setPreferences({ ...DEFAULT_PREFERENCES, ...parsedPrefs });
          }
        }
      } else {
        // Not authenticated, use localStorage only
        const localPrefs = localStorage.getItem('harmony_preferences');
        if (localPrefs) {
          const parsedPrefs = JSON.parse(localPrefs);
          setPreferences({ ...DEFAULT_PREFERENCES, ...parsedPrefs });
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      // Fallback to localStorage on any error
      const localPrefs = localStorage.getItem('harmony_preferences');
      if (localPrefs) {
        const parsedPrefs = JSON.parse(localPrefs);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsedPrefs });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Save preferences to database with localStorage backup
  const savePreferences = useCallback(async (newPreferences: PreferencesData) => {
    setSaving(true);
    try {
      // Always save to localStorage first
      localStorage.setItem('harmony_preferences', JSON.stringify(newPreferences));
      setPreferences(newPreferences);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Save to database if authenticated
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            preferences_data: newPreferences as any
          });

        if (error) throw error;

        toast({
          title: "Preferences Saved",
          description: "Your preferences have been successfully updated."
        });
      } else {
        toast({
          title: "Preferences Saved Locally",
          description: "Preferences saved to device. Sign in to sync across devices."
        });
      }
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences to server, but saved locally.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }, [toast]);

  // Update specific preference
  const updatePreference = useCallback((section: keyof PreferencesData, key: string, value: any) => {
    const newPreferences = {
      ...preferences,
      [section]: {
        ...preferences[section],
        [key]: value
      }
    };
    setPreferences(newPreferences);
  }, [preferences]);

  // Auto-save preferences when they change (debounced)
  useEffect(() => {
    if (!loading && preferences !== DEFAULT_PREFERENCES) {
      const timeoutId = setTimeout(() => {
        savePreferences(preferences);
      }, 1000); // 1 second delay for auto-save

      return () => clearTimeout(timeoutId);
    }
  }, [preferences, loading, savePreferences]);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    updatePreference,
    savePreferences,
    loading,
    saving,
    reload: loadPreferences
  };
};