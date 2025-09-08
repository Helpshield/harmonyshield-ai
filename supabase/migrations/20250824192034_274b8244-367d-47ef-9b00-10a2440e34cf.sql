-- Create tracking_links table
CREATE TABLE public.tracking_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_url TEXT NOT NULL DEFAULT 'https://harmonyshield.com',
  short_code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create visitor_data table for captured information
CREATE TABLE public.visitor_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_link_id UUID NOT NULL REFERENCES public.tracking_links(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  browser_info JSONB,
  location_data JSONB,
  device_info JSONB,
  captured_image_url TEXT,
  referer TEXT,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  fingerprint_hash TEXT
);

-- Enable RLS on both tables
ALTER TABLE public.tracking_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for tracking_links
CREATE POLICY "Users can view their own tracking links" 
ON public.tracking_links 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tracking links" 
ON public.tracking_links 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracking links" 
ON public.tracking_links 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracking links" 
ON public.tracking_links 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tracking links" 
ON public.tracking_links 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for visitor_data
CREATE POLICY "Users can view data for their own tracking links" 
ON public.visitor_data 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.tracking_links 
  WHERE tracking_links.id = visitor_data.tracking_link_id 
  AND tracking_links.user_id = auth.uid()
));

CREATE POLICY "Service can insert visitor data" 
ON public.visitor_data 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all visitor data" 
ON public.visitor_data 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_tracking_links_user_id ON public.tracking_links(user_id);
CREATE INDEX idx_tracking_links_short_code ON public.tracking_links(short_code);
CREATE INDEX idx_visitor_data_tracking_link_id ON public.visitor_data(tracking_link_id);
CREATE INDEX idx_visitor_data_visited_at ON public.visitor_data(visited_at);

-- Create trigger for updating timestamps
CREATE TRIGGER update_tracking_links_updated_at
  BEFORE UPDATE ON public.tracking_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();