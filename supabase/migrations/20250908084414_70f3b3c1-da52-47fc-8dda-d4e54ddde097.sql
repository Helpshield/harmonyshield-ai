-- Create audit logs table for admin actions
CREATE TABLE public.admin_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for audit logs
CREATE POLICY "Admins can view all audit logs" 
ON public.admin_audit_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service can insert audit logs" 
ON public.admin_audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Create function to automatically log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.admin_audit_logs (
    admin_user_id,
    action,
    entity_type,
    entity_id,
    details
  ) VALUES (
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    p_details
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Create analytics aggregation view for performance
CREATE OR REPLACE VIEW public.analytics_summary AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  'scam_reports' as metric_type,
  COUNT(*) as count,
  AVG(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as success_rate
FROM public.scam_reports
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)

UNION ALL

SELECT 
  DATE_TRUNC('day', created_at) as date,
  'scan_results' as metric_type,
  COUNT(*) as count,
  AVG(CASE WHEN risk_level = 'high' THEN 1 ELSE 0 END) as success_rate
FROM public.scan_results
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)

UNION ALL

SELECT 
  DATE_TRUNC('day', created_at) as date,
  'deep_search_requests' as metric_type,
  COUNT(*) as count,
  AVG(CASE WHEN search_status = 'completed' THEN 1 ELSE 0 END) as success_rate
FROM public.deep_search_requests
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)

UNION ALL

SELECT 
  DATE_TRUNC('day', created_at) as date,
  'recovery_requests' as metric_type,
  COUNT(*) as count,
  AVG(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as success_rate
FROM public.recovery_requests
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at);

-- Grant permissions
GRANT SELECT ON public.analytics_summary TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_admin_action TO authenticated;