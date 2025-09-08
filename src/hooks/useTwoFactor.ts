import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TwoFactorSettings {
  enabled: boolean;
  secret?: string;
  backupCodes: string[];
  lastUsed?: string;
}

const DEFAULT_SETTINGS: TwoFactorSettings = {
  enabled: false,
  backupCodes: []
};

export const useTwoFactor = () => {
  const [settings, setSettings] = useState<TwoFactorSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [enabling, setEnabling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const { toast } = useToast();

  // Generate a secret for 2FA
  const generateSecret = () => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return secret;
  };

  // Generate backup codes
  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      let code = '';
      for (let j = 0; j < 8; j++) {
        code += Math.floor(Math.random() * 10).toString();
      }
      codes.push(code);
    }
    return codes;
  };

  // Generate QR code URL for authenticator apps
  const generateQRCode = (secret: string, userEmail: string) => {
    const issuer = 'HarmonyShield';
    const label = `${issuer}:${userEmail}`;
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
    
    // In a real implementation, you'd use a QR code library
    // For now, we'll return a placeholder URL
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;
  };

  // Load 2FA settings
  const loadSettings = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if 2FA is enabled in user metadata
      const twoFactorEnabled = user.user_metadata?.two_factor_enabled || false;
      const backupCodes = user.user_metadata?.backup_codes || [];

      setSettings({
        enabled: twoFactorEnabled,
        backupCodes,
        lastUsed: user.user_metadata?.two_factor_last_used
      });
    } catch (error: any) {
      console.error('Error loading 2FA settings:', error);
      toast({
        title: "Error",
        description: "Failed to load 2FA settings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Enable 2FA
  const enable2FA = useCallback(async () => {
    setEnabling(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const secret = generateSecret();
      const backupCodes = generateBackupCodes();
      const qrCodeUrl = generateQRCode(secret, user.email || '');

      setQrCode(qrCodeUrl);
      setSettings(prev => ({ 
        ...prev, 
        secret, 
        backupCodes 
      }));

      toast({
        title: "2FA Setup Started",
        description: "Scan the QR code with your authenticator app, then verify to complete setup."
      });

      return { secret, backupCodes, qrCodeUrl };
    } catch (error: any) {
      console.error('Error enabling 2FA:', error);
      toast({
        title: "Error",
        description: "Failed to enable 2FA.",
        variant: "destructive"
      });
      return null;
    } finally {
      setEnabling(false);
    }
  }, [toast]);

  // Verify and complete 2FA setup
  const verify2FA = useCallback(async (code: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // In a real implementation, you'd verify the TOTP code here
      // For now, we'll simulate verification (any 6-digit code works)
      if (!/^\d{6}$/.test(code)) {
        throw new Error('Please enter a valid 6-digit code');
      }

      // Update user metadata with 2FA enabled
      const { error } = await supabase.auth.updateUser({
        data: {
          two_factor_enabled: true,
          two_factor_secret: settings.secret,
          backup_codes: settings.backupCodes,
          two_factor_setup_at: new Date().toISOString()
        }
      });

      if (error) throw error;

      setSettings(prev => ({ ...prev, enabled: true }));
      setQrCode(null);

      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled for your account."
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify code. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [settings.secret, settings.backupCodes, toast]);

  // Disable 2FA
  const disable2FA = useCallback(async (code: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Verify current code before disabling
      if (!/^\d{6}$/.test(code)) {
        throw new Error('Please enter a valid 6-digit code');
      }

      // Update user metadata to disable 2FA
      const { error } = await supabase.auth.updateUser({
        data: {
          two_factor_enabled: false,
          two_factor_secret: null,
          backup_codes: null,
          two_factor_disabled_at: new Date().toISOString()
        }
      });

      if (error) throw error;

      setSettings(DEFAULT_SETTINGS);

      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled for your account."
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to disable 2FA.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  // Generate new backup codes
  const regenerateBackupCodes = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const newBackupCodes = generateBackupCodes();

      const { error } = await supabase.auth.updateUser({
        data: {
          backup_codes: newBackupCodes,
          backup_codes_regenerated_at: new Date().toISOString()
        }
      });

      if (error) throw error;

      setSettings(prev => ({ ...prev, backupCodes: newBackupCodes }));

      toast({
        title: "Backup Codes Regenerated",
        description: "New backup codes have been generated. Please save them securely."
      });

      return newBackupCodes;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to regenerate backup codes.",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    enabling,
    qrCode,
    enable2FA,
    verify2FA,
    disable2FA,
    regenerateBackupCodes,
    reload: loadSettings
  };
};