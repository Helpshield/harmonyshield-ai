import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BiometricSettings {
  id?: string;
  fingerprint_enabled: boolean;
  face_id_enabled: boolean;
  voice_recognition_enabled: boolean;
  security_level: 'standard' | 'high' | 'maximum';
  auto_lock_timeout: number;
  require_biometric_for_sensitive: boolean;
  device_fingerprints: any[];
  backup_methods: any[];
}

const DEFAULT_SETTINGS: BiometricSettings = {
  fingerprint_enabled: false,
  face_id_enabled: false,
  voice_recognition_enabled: false,
  security_level: 'standard',
  auto_lock_timeout: 300,
  require_biometric_for_sensitive: true,
  device_fingerprints: [],
  backup_methods: []
};

export const useBiometricSettings = () => {
  const [settings, setSettings] = useState<BiometricSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Check if biometric APIs are available
  const checkBiometricSupport = useCallback(() => {
    const support = {
      fingerprint: 'credentials' in navigator && 'PublicKeyCredential' in window,
      faceId: 'credentials' in navigator && 'PublicKeyCredential' in window,
      voiceRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
    };
    return support;
  }, []);

  // Load biometric settings
  const loadSettings = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('biometric_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          id: data.id,
          fingerprint_enabled: data.fingerprint_enabled,
          face_id_enabled: data.face_id_enabled,
          voice_recognition_enabled: data.voice_recognition_enabled,
          security_level: data.security_level as 'standard' | 'high' | 'maximum',
          auto_lock_timeout: data.auto_lock_timeout,
          require_biometric_for_sensitive: data.require_biometric_for_sensitive,
          device_fingerprints: Array.isArray(data.device_fingerprints) ? data.device_fingerprints : [],
          backup_methods: Array.isArray(data.backup_methods) ? data.backup_methods : []
        });
      }
    } catch (error: any) {
      console.error('Error loading biometric settings:', error);
      toast({
        title: "Error",
        description: "Failed to load biometric settings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Save biometric settings
  const saveSettings = useCallback(async (newSettings: Partial<BiometricSettings>) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updatedSettings = { ...settings, ...newSettings };
      
      const { error } = await supabase
        .from('biometric_settings')
        .upsert({
          user_id: user.id,
          fingerprint_enabled: updatedSettings.fingerprint_enabled,
          face_id_enabled: updatedSettings.face_id_enabled,
          voice_recognition_enabled: updatedSettings.voice_recognition_enabled,
          security_level: updatedSettings.security_level,
          auto_lock_timeout: updatedSettings.auto_lock_timeout,
          require_biometric_for_sensitive: updatedSettings.require_biometric_for_sensitive,
          device_fingerprints: updatedSettings.device_fingerprints,
          backup_methods: updatedSettings.backup_methods,
          last_used: new Date().toISOString()
        });

      if (error) throw error;

      setSettings(updatedSettings);
      
      toast({
        title: "Settings Updated",
        description: "Your biometric settings have been saved successfully."
      });
    } catch (error: any) {
      console.error('Error saving biometric settings:', error);
      toast({
        title: "Error",
        description: "Failed to save biometric settings.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }, [settings, toast]);

  // Enroll biometric
  const enrollBiometric = useCallback(async (type: 'fingerprint' | 'face_id') => {
    try {
      // Mock biometric enrollment - in real app would use WebAuthn API
      if (!checkBiometricSupport().fingerprint) {
        throw new Error('Biometric authentication is not supported on this device');
      }

      const enrollmentDate = new Date().toISOString();
      
      await saveSettings({
        [`${type}_enabled`]: true
      } as Partial<BiometricSettings>);

      toast({
        title: "Enrollment Complete",
        description: `${type === 'fingerprint' ? 'Fingerprint' : 'Face ID'} has been successfully enrolled.`
      });
    } catch (error: any) {
      toast({
        title: "Enrollment Failed",
        description: error.message || "Failed to enroll biometric authentication.",
        variant: "destructive"
      });
    }
  }, [saveSettings, checkBiometricSupport, toast]);

  // Test biometric
  const testBiometric = useCallback(async (type: 'fingerprint' | 'face_id') => {
    try {
      // Mock biometric test - in real app would use WebAuthn API
      toast({
        title: "Test Successful",
        description: `${type === 'fingerprint' ? 'Fingerprint' : 'Face ID'} authentication test completed successfully.`
      });
    } catch (error: any) {
      toast({
        title: "Test Failed",
        description: error.message || "Biometric authentication test failed.",
        variant: "destructive"
      });
    }
  }, [toast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    saving,
    saveSettings,
    enrollBiometric,
    testBiometric,
    checkBiometricSupport,
    reload: loadSettings
  };
};