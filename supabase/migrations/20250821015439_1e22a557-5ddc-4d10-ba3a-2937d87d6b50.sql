-- Create deep_search_requests table for tracking search requests
CREATE TABLE public.deep_search_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  search_type TEXT NOT NULL CHECK (search_type IN ('text', 'image', 'combined')),
  search_query TEXT,
  image_urls TEXT[],
  search_status TEXT NOT NULL DEFAULT 'pending' CHECK (search_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  search_metadata JSONB DEFAULT '{}'::jsonb
);

-- Create deep_search_results table for storing search results
CREATE TABLE public.deep_search_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  search_request_id UUID NOT NULL REFERENCES public.deep_search_requests(id) ON DELETE CASCADE,
  result_type TEXT NOT NULL CHECK (result_type IN ('web_search', 'image_analysis', 'entity_info', 'social_media', 'news_mention', 'public_record')),
  source_name TEXT NOT NULL,
  source_url TEXT,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
  relevance_score FLOAT CHECK (relevance_score >= 0 AND relevance_score <= 1),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create search_analytics table for tracking usage and performance
CREATE TABLE public.search_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  search_type TEXT NOT NULL,
  query_length INTEGER,
  results_count INTEGER DEFAULT 0,
  processing_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.deep_search_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deep_search_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deep_search_requests
CREATE POLICY "Users can create their own search requests" 
ON public.deep_search_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own search requests" 
ON public.deep_search_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own search requests" 
ON public.deep_search_requests 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all search requests" 
ON public.deep_search_requests 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for deep_search_results
CREATE POLICY "Users can view results for their own searches" 
ON public.deep_search_results 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.deep_search_requests 
    WHERE id = search_request_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Service can insert search results" 
ON public.deep_search_results 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all search results" 
ON public.deep_search_results 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for search_analytics
CREATE POLICY "Users can view their own analytics" 
ON public.search_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service can insert analytics" 
ON public.search_analytics 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all analytics" 
ON public.search_analytics 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_deep_search_requests_user_id ON public.deep_search_requests(user_id);
CREATE INDEX idx_deep_search_requests_status ON public.deep_search_requests(search_status);
CREATE INDEX idx_deep_search_requests_created_at ON public.deep_search_requests(created_at DESC);

CREATE INDEX idx_deep_search_results_search_request_id ON public.deep_search_results(search_request_id);
CREATE INDEX idx_deep_search_results_confidence_score ON public.deep_search_results(confidence_score DESC);
CREATE INDEX idx_deep_search_results_relevance_score ON public.deep_search_results(relevance_score DESC);

CREATE INDEX idx_search_analytics_user_id ON public.search_analytics(user_id);
CREATE INDEX idx_search_analytics_created_at ON public.search_analytics(created_at DESC);

-- Create trigger for updated_at timestamps
CREATE TRIGGER update_deep_search_requests_updated_at
  BEFORE UPDATE ON public.deep_search_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deep_search_results_updated_at
  BEFORE UPDATE ON public.deep_search_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();