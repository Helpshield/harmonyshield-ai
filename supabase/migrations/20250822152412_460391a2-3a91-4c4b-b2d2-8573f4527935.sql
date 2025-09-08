-- Fix search path security issue for delete_search_results_cascade function
CREATE OR REPLACE FUNCTION delete_search_results_cascade()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = 'public'
LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM public.deep_search_results WHERE search_request_id = OLD.id;
  RETURN OLD;
END;
$$;