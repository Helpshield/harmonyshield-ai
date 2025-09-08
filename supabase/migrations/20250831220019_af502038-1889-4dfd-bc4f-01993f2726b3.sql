-- Create threat_reports table
CREATE TABLE public.threat_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  threat_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'active',
  source_data JSONB DEFAULT '{}'::jsonb,
  detection_methods TEXT[],
  affected_systems TEXT[],
  recommendations TEXT[],
  threat_score INTEGER DEFAULT 0,
  first_detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create threat_indicators table
CREATE TABLE public.threat_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  threat_report_id UUID REFERENCES public.threat_reports(id) ON DELETE CASCADE,
  indicator_type TEXT NOT NULL,
  indicator_value TEXT NOT NULL,
  confidence_level NUMERIC(3,2) DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.threat_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_indicators ENABLE ROW LEVEL SECURITY;

-- Create policies for threat_reports
CREATE POLICY "Admins can view all threat reports" 
ON public.threat_reports 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage threat reports" 
ON public.threat_reports 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service can manage threat reports" 
ON public.threat_reports 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create policies for threat_indicators
CREATE POLICY "Admins can view all threat indicators" 
ON public.threat_indicators 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage threat indicators" 
ON public.threat_indicators 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service can manage threat indicators" 
ON public.threat_indicators 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at on threat_reports
CREATE TRIGGER update_threat_reports_updated_at
BEFORE UPDATE ON public.threat_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_threat_reports_severity ON public.threat_reports(severity);
CREATE INDEX idx_threat_reports_status ON public.threat_reports(status);
CREATE INDEX idx_threat_reports_threat_type ON public.threat_reports(threat_type);
CREATE INDEX idx_threat_reports_created_at ON public.threat_reports(created_at DESC);
CREATE INDEX idx_threat_indicators_report_id ON public.threat_indicators(threat_report_id);
CREATE INDEX idx_threat_indicators_type ON public.threat_indicators(indicator_type);

-- Insert sample threat reports data
INSERT INTO public.threat_reports (title, description, threat_type, severity, status, threat_score, detection_methods, affected_systems, recommendations, source_data) VALUES 
('Phishing Campaign Detected', 'Large-scale phishing campaign targeting financial institutions', 'phishing', 'high', 'active', 85, ARRAY['Email Analysis', 'Domain Reputation'], ARRAY['Email Systems', 'Web Browsers'], ARRAY['Block malicious domains', 'Update email filters'], '{"domains": ["fake-bank.com", "phish-site.net"], "email_count": 1250}'::jsonb),
('Malware Distribution Network', 'Botnet distributing ransomware through compromised websites', 'malware', 'critical', 'active', 95, ARRAY['Network Traffic Analysis', 'File Hashing'], ARRAY['Web Servers', 'Endpoint Devices'], ARRAY['Implement network segmentation', 'Deploy advanced endpoint protection'], '{"c2_servers": ["192.168.1.100", "malware-c2.example.com"], "infected_hosts": 45}'::jsonb),
('Data Breach Attempt', 'Unauthorized access attempts to customer database', 'data_breach', 'high', 'investigating', 78, ARRAY['Log Analysis', 'Behavioral Analytics'], ARRAY['Database Servers', 'Authentication Systems'], ARRAY['Strengthen access controls', 'Enable additional monitoring'], '{"failed_attempts": 156, "source_ips": ["10.0.0.50", "203.0.113.42"]}'::jsonb),
('Social Engineering Campaign', 'Targeted social engineering attacks on executives', 'social_engineering', 'medium', 'active', 65, ARRAY['Call Pattern Analysis', 'Email Metadata'], ARRAY['Corporate Communications', 'Executive Accounts'], ARRAY['Security awareness training', 'Implement verification protocols'], '{"target_executives": 8, "attack_vectors": ["phone", "email", "linkedin"]}'::jsonb),
('Suspicious Network Activity', 'Unusual outbound network traffic patterns detected', 'network_anomaly', 'medium', 'monitoring', 58, ARRAY['Traffic Analysis', 'Anomaly Detection'], ARRAY['Network Infrastructure', 'Firewall Systems'], ARRAY['Review firewall rules', 'Investigate traffic patterns'], '{"traffic_volume": "2.5TB", "suspicious_destinations": 12}'::jsonb);

-- Insert corresponding threat indicators
INSERT INTO public.threat_indicators (threat_report_id, indicator_type, indicator_value, confidence_level) VALUES 
((SELECT id FROM public.threat_reports WHERE title = 'Phishing Campaign Detected'), 'domain', 'fake-bank.com', 0.95),
((SELECT id FROM public.threat_reports WHERE title = 'Phishing Campaign Detected'), 'email_subject', 'Urgent: Verify Your Account', 0.85),
((SELECT id FROM public.threat_reports WHERE title = 'Malware Distribution Network'), 'ip_address', '192.168.1.100', 0.90),
((SELECT id FROM public.threat_reports WHERE title = 'Malware Distribution Network'), 'file_hash', 'a1b2c3d4e5f6789012345678901234567890abcd', 0.98),
((SELECT id FROM public.threat_reports WHERE title = 'Data Breach Attempt'), 'ip_address', '203.0.113.42', 0.87),
((SELECT id FROM public.threat_reports WHERE title = 'Social Engineering Campaign'), 'phone_number', '+1-555-SCAM-123', 0.75),
((SELECT id FROM public.threat_reports WHERE title = 'Suspicious Network Activity'), 'ip_range', '10.0.0.0/24', 0.70);