-- Create enum for recovery types
CREATE TYPE public.recovery_type AS ENUM ('cash', 'cards', 'crypto');

-- Create enum for recovery status
CREATE TYPE public.recovery_status AS ENUM ('pending', 'investigating', 'in_progress', 'completed', 'closed');

-- Create recovery_requests table
CREATE TABLE public.recovery_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recovery_type recovery_type NOT NULL,
  status recovery_status NOT NULL DEFAULT 'pending',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  incident_date TIMESTAMP WITH TIME ZONE,
  amount_lost DECIMAL(15,2),
  currency TEXT,
  
  -- Cash recovery specific fields
  bank_details JSONB DEFAULT '{}',
  transaction_reference TEXT,
  
  -- Cards recovery specific fields
  card_details JSONB DEFAULT '{}',
  last_four_digits TEXT,
  
  -- Crypto recovery specific fields
  wallet_address TEXT,
  transaction_hash TEXT,
  blockchain_network TEXT,
  
  -- Evidence and contact info
  evidence_files TEXT[],
  contact_method TEXT,
  contact_details JSONB DEFAULT '{}',
  
  -- Admin fields
  assigned_admin_id UUID,
  admin_notes TEXT,
  progress_updates JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.recovery_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for recovery requests
CREATE POLICY "Users can create their own recovery requests" 
ON public.recovery_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own recovery requests" 
ON public.recovery_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own recovery requests" 
ON public.recovery_requests 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all recovery requests" 
ON public.recovery_requests 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all recovery requests" 
ON public.recovery_requests 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_recovery_requests_updated_at
BEFORE UPDATE ON public.recovery_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();