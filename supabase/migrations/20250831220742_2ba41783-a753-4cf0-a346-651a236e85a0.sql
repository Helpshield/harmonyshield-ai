-- Create cron job to automatically generate threat reports every hour
-- First, ensure pg_cron extension is enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the threat report generation to run every hour
SELECT cron.schedule(
  'generate-threat-reports-hourly',
  '0 * * * *',
  $$
  SELECT
    net.http_post(
        url:='https://hgqhgwdzsyqrjtthsmyg.supabase.co/functions/v1/generate-threat-reports',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhncWhnd2R6c3lxcmp0dGhzbXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MjU1OTAsImV4cCI6MjA3MTMwMTU5MH0.VBEXTbT1mUcKmn8EB0RxvJLTfQU2p4pe13vWkL63W6M"}'::jsonb,
        body:=concat('{"trigger": "scheduled", "timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);