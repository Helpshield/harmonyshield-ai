-- Fix security issues by setting search_path for existing functions
DROP FUNCTION IF EXISTS public.has_role(_user_id uuid, _role app_role) CASCADE;
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- Recreate the RLS policies that depend on has_role function
-- User roles policies
CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Scam reports policies
CREATE POLICY "Admins can view all reports" 
ON public.scam_reports 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all reports" 
ON public.scam_reports 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Scan results policies
CREATE POLICY "Admins can view all scan results" 
ON public.scan_results 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Deep search requests policies
CREATE POLICY "Admins can view all search requests" 
ON public.deep_search_requests 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Deep search results policies
CREATE POLICY "Admins can view all search results" 
ON public.deep_search_results 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Search analytics policies
CREATE POLICY "Admins can view all analytics" 
ON public.search_analytics 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix handle_new_user function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'name');
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$function$;