-- Create biometric_settings table for user biometric authentication preferences
CREATE TABLE public.biometric_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  fingerprint_enabled BOOLEAN NOT NULL DEFAULT false,
  face_id_enabled BOOLEAN NOT NULL DEFAULT false,
  voice_recognition_enabled BOOLEAN NOT NULL DEFAULT false,
  device_fingerprints JSONB DEFAULT '[]'::jsonb,
  enrollment_date TIMESTAMP WITH TIME ZONE,
  last_used TIMESTAMP WITH TIME ZONE,
  backup_methods JSONB DEFAULT '[]'::jsonb,
  security_level TEXT NOT NULL DEFAULT 'standard' CHECK (security_level IN ('standard', 'high', 'maximum')),
  auto_lock_timeout INTEGER DEFAULT 300, -- 5 minutes in seconds
  require_biometric_for_sensitive BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.biometric_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for biometric settings
CREATE POLICY "Users can view their own biometric settings" 
ON public.biometric_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own biometric settings" 
ON public.biometric_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own biometric settings" 
ON public.biometric_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own biometric settings" 
ON public.biometric_settings 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all biometric settings" 
ON public.biometric_settings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create API keys table for Advanced tab
CREATE TABLE public.user_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  api_key_hash TEXT NOT NULL UNIQUE,
  api_key_prefix TEXT NOT NULL, -- First 8 chars for display
  permissions JSONB NOT NULL DEFAULT '["read"]'::jsonb,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for API keys
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies for API keys
CREATE POLICY "Users can view their own API keys" 
ON public.user_api_keys 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API keys" 
ON public.user_api_keys 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" 
ON public.user_api_keys 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" 
ON public.user_api_keys 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all API keys" 
ON public.user_api_keys 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_biometric_settings_updated_at
BEFORE UPDATE ON public.biometric_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_api_keys_updated_at
BEFORE UPDATE ON public.user_api_keys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_biometric_settings_user_id ON public.biometric_settings(user_id);
CREATE INDEX idx_user_api_keys_user_id ON public.user_api_keys(user_id);
CREATE INDEX idx_user_api_keys_hash ON public.user_api_keys(api_key_hash);