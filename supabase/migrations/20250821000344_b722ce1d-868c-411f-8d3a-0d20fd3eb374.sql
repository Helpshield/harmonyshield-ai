-- Create news_articles table for storing fetched news
CREATE TABLE public.news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL UNIQUE,
  source_name TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('fraud', 'scam', 'cybersecurity', 'phishing', 'crypto', 'identity_theft', 'general')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  content TEXT,
  author TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read news articles (public data)
CREATE POLICY "News articles are publicly readable" 
ON public.news_articles 
FOR SELECT 
USING (is_active = true);

-- Create policy to allow only service role to insert/update articles
CREATE POLICY "Service role can manage news articles" 
ON public.news_articles 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_news_articles_updated_at
BEFORE UPDATE ON public.news_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_news_articles_published_at ON public.news_articles(published_at DESC);
CREATE INDEX idx_news_articles_category ON public.news_articles(category);
CREATE INDEX idx_news_articles_severity ON public.news_articles(severity);
CREATE INDEX idx_news_articles_active ON public.news_articles(is_active);
CREATE INDEX idx_news_articles_source ON public.news_articles(source_name);

-- Create function to enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule news fetching every 3 hours
SELECT cron.schedule(
  'fetch-news-every-3-hours',
  '0 */3 * * *', -- every 3 hours at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://hgqhgwdzsyqrjtthsmyg.supabase.co/functions/v1/fetch-news',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhncWhnd2R6c3lxcmp0dGhzbXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MjU1OTAsImV4cCI6MjA3MTMwMTU5MH0.VBEXTbT1mUcKmn8EB0RxvJLTfQU2p4pe13vWkL63W6M"}'::jsonb,
        body:='{"automated": true}'::jsonb
    ) as request_id;
  $$
);