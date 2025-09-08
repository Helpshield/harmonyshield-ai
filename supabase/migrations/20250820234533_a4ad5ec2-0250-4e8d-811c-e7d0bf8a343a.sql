-- Create scan_results table for storing scan data
CREATE TABLE public.scan_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('url', 'file', 'text')),
  target_content TEXT NOT NULL,
  scan_status TEXT NOT NULL DEFAULT 'pending' CHECK (scan_status IN ('pending', 'scanning', 'completed', 'failed')),
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  risk_level TEXT CHECK (risk_level IN ('safe', 'low', 'medium', 'high', 'critical')),
  virustotal_results JSONB,
  openai_analysis JSONB,
  recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;

-- Create policies for scan_results
CREATE POLICY "Users can create their own scan results" 
ON public.scan_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own scan results" 
ON public.scan_results 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own scan results" 
ON public.scan_results 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all scan results" 
ON public.scan_results 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scan_results_updated_at
BEFORE UPDATE ON public.scan_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_scan_results_user_id ON public.scan_results(user_id);
CREATE INDEX idx_scan_results_status ON public.scan_results(scan_status);
CREATE INDEX idx_scan_results_created_at ON public.scan_results(created_at DESC);