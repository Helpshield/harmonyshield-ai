-- Create storage bucket for recovery evidence files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('recovery-evidence', 'recovery-evidence', false);

-- Create storage policies for recovery evidence
CREATE POLICY "Users can upload their own recovery evidence" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'recovery-evidence' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own recovery evidence" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'recovery-evidence' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all recovery evidence" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'recovery-evidence' AND 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Enable realtime for recovery_requests table
ALTER TABLE recovery_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE recovery_requests;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  related_id UUID,
  related_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Create trigger for updated_at
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();