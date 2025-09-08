-- Enable users to delete their own search requests and results
CREATE POLICY "Users can delete their own search requests" 
ON public.deep_search_requests 
FOR DELETE 
USING (auth.uid() = user_id);

-- When a search request is deleted, cascade delete the results
CREATE POLICY "Users can delete their own search results" 
ON public.deep_search_results 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM deep_search_requests 
    WHERE deep_search_requests.id = deep_search_results.search_request_id 
    AND deep_search_requests.user_id = auth.uid()
  )
);

-- Add additional metadata fields for enhanced social media and fraud detection
ALTER TABLE public.deep_search_results 
ADD COLUMN social_media_analysis jsonb DEFAULT '{}',
ADD COLUMN fraud_risk_score double precision DEFAULT 0,
ADD COLUMN fake_profile_indicators text[] DEFAULT '{}';

-- Create function to cascade delete search results when request is deleted
CREATE OR REPLACE FUNCTION delete_search_results_cascade()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.deep_search_results WHERE search_request_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically clean up results when request is deleted
CREATE TRIGGER cascade_delete_search_results
  BEFORE DELETE ON public.deep_search_requests
  FOR EACH ROW
  EXECUTE FUNCTION delete_search_results_cascade();