import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ApiKey {
  id: string;
  key_name: string;
  api_key_prefix: string;
  permissions: string[];
  rate_limit_per_hour: number;
  is_active: boolean;
  last_used?: string;
  expires_at?: string;
  created_at: string;
}

interface CreateApiKeyData {
  name: string;
  permissions: string[];
  rateLimit: number;
  expiresAt?: Date;
}

export const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  // Load API keys
  const loadApiKeys = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_api_keys')
        .select('id, key_name, api_key_prefix, permissions, rate_limit_per_hour, is_active, last_used, expires_at, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setApiKeys((data || []).map(item => ({
        ...item,
        permissions: Array.isArray(item.permissions) ? (item.permissions as string[]) : []
      })));
    } catch (error: any) {
      console.error('Error loading API keys:', error);
      toast({
        title: "Error",
        description: "Failed to load API keys.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Generate a secure API key
  const generateApiKey = () => {
    const prefix = 'hsp_';
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    
    for (let i = 0; i < 48; i++) {
      key += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return prefix + key;
  };

  // Hash API key for storage
  const hashApiKey = async (apiKey: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Create new API key
  const createApiKey = useCallback(async (keyData: CreateApiKeyData): Promise<string | null> => {
    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const apiKey = generateApiKey();
      const apiKeyHash = await hashApiKey(apiKey);
      const apiKeyPrefix = apiKey.substring(0, 12) + '...';

      const { error } = await supabase
        .from('user_api_keys')
        .insert({
          user_id: user.id,
          key_name: keyData.name,
          api_key_hash: apiKeyHash,
          api_key_prefix: apiKeyPrefix,
          permissions: keyData.permissions,
          rate_limit_per_hour: keyData.rateLimit,
          expires_at: keyData.expiresAt?.toISOString()
        });

      if (error) throw error;

      await loadApiKeys();
      
      toast({
        title: "API Key Created",
        description: "Your new API key has been generated. Make sure to copy it now - you won't be able to see it again."
      });

      return apiKey;
    } catch (error: any) {
      console.error('Error creating API key:', error);
      toast({
        title: "Error",
        description: "Failed to create API key.",
        variant: "destructive"
      });
      return null;
    } finally {
      setCreating(false);
    }
  }, [loadApiKeys, toast]);

  // Toggle API key status
  const toggleApiKey = useCallback(async (keyId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('user_api_keys')
        .update({ is_active: isActive })
        .eq('id', keyId);

      if (error) throw error;

      await loadApiKeys();
      
      toast({
        title: isActive ? "API Key Enabled" : "API Key Disabled",
        description: `Your API key has been ${isActive ? 'enabled' : 'disabled'}.`
      });
    } catch (error: any) {
      console.error('Error toggling API key:', error);
      toast({
        title: "Error",
        description: "Failed to update API key status.",
        variant: "destructive"
      });
    }
  }, [loadApiKeys, toast]);

  // Delete API key
  const deleteApiKey = useCallback(async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('user_api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      await loadApiKeys();
      
      toast({
        title: "API Key Deleted",
        description: "Your API key has been permanently deleted."
      });
    } catch (error: any) {
      console.error('Error deleting API key:', error);
      toast({
        title: "Error",
        description: "Failed to delete API key.",
        variant: "destructive"
      });
    }
  }, [loadApiKeys, toast]);

  useEffect(() => {
    loadApiKeys();
  }, [loadApiKeys]);

  return {
    apiKeys,
    loading,
    creating,
    createApiKey,
    toggleApiKey,
    deleteApiKey,
    reload: loadApiKeys
  };
};