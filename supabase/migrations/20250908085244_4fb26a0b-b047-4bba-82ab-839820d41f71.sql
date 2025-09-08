-- Fix security definer view issue by recreating the view without SECURITY DEFINER
DROP VIEW IF EXISTS public.analytics_summary;

CREATE VIEW public.analytics_summary AS
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

-- Fix the search path issue by explicitly setting it in the function
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