-- Create scam_database table for storing reported scam platforms and URLs
CREATE TABLE public.scam_database (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_name text NOT NULL,
  platform_url text NOT NULL,
  scam_type text NOT NULL DEFAULT 'phishing',
  threat_level text NOT NULL DEFAULT 'medium',
  description text,
  reported_date timestamp with time zone NOT NULL DEFAULT now(),
  last_verified timestamp with time zone NOT NULL DEFAULT now(),
  source_name text NOT NULL DEFAULT 'community',
  is_active boolean NOT NULL DEFAULT true,
  victim_count integer DEFAULT 0,
  financial_impact numeric DEFAULT 0,
  tags text[] DEFAULT '{}',
  country text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scam_database ENABLE ROW LEVEL SECURITY;

-- Allow public read access for active scam records
CREATE POLICY "Scam database is publicly readable" 
ON public.scam_database 
FOR SELECT 
USING (is_active = true);

-- Service can manage scam database
CREATE POLICY "Service can manage scam database" 
ON public.scam_database 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Admins can manage scam database
CREATE POLICY "Admins can manage scam database" 
ON public.scam_database 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_scam_database_updated_at
BEFORE UPDATE ON public.scam_database
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_scam_database_platform_name ON public.scam_database(platform_name);
CREATE INDEX idx_scam_database_threat_level ON public.scam_database(threat_level);
CREATE INDEX idx_scam_database_active ON public.scam_database(is_active);
CREATE INDEX idx_scam_database_reported_date ON public.scam_database(reported_date DESC);

-- Insert some sample scam data
INSERT INTO public.scam_database 
(platform_name, platform_url, scam_type, threat_level, description, source_name, victim_count, financial_impact, tags, country)
VALUES 
('FakeAmazon-Security', 'amazon-security-check.net', 'phishing', 'high', 'Fake Amazon security page attempting to steal login credentials', 'FTC Database', 2847, 1250000, '{phishing,identity_theft,amazon}', 'Multiple'),
('CryptoEarn-Pro', 'cryptoearnpro.com', 'investment_scam', 'critical', 'Fake cryptocurrency investment platform promising unrealistic returns', 'FBI IC3', 5621, 8900000, '{crypto,investment,ponzi}', 'Multiple'),
('InstagramVerification', 'ig-verification-team.com', 'phishing', 'high', 'Fake Instagram verification service stealing account credentials', 'Community Reports', 1203, 45000, '{social_media,phishing,instagram}', 'Multiple'),
('PayPal-Dispute-Center', 'paypal-dispute-resolution.org', 'phishing', 'high', 'Fake PayPal dispute resolution page collecting payment information', 'Anti-Phishing Working Group', 3452, 890000, '{phishing,paypal,payment_fraud}', 'Multiple'),
('TikTokMonetization', 'tiktok-creator-fund-apply.net', 'phishing', 'medium', 'Fake TikTok creator fund application page', 'Social Media Safety Alliance', 876, 12000, '{social_media,phishing,tiktok}', 'Multiple'),
('Microsoft-Security-Alert', 'microsoft-security-team.info', 'tech_support_scam', 'high', 'Fake Microsoft security alert page with tech support scam', 'AARP Fraud Watch', 2104, 650000, '{tech_support,microsoft,phishing}', 'Multiple'),
('Netflix-Billing-Update', 'netflix-account-verification.com', 'phishing', 'medium', 'Fake Netflix billing update page stealing payment details', 'Better Business Bureau', 1567, 180000, '{streaming,phishing,netflix}', 'Multiple'),
('WhatsApp-Gold', 'whatsapp-gold-download.org', 'malware', 'critical', 'Fake WhatsApp Gold download containing malware', 'Cybersecurity Firms', 4321, 200000, '{malware,whatsapp,social_media}', 'Multiple');

-- Enable realtime for scam_database
ALTER PUBLICATION supabase_realtime ADD TABLE public.scam_database;