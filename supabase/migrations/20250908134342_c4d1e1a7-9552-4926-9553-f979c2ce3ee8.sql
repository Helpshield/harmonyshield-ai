-- Fix the database relationship between profiles and user_roles
-- Add foreign key constraint to ensure data consistency

ALTER TABLE public.user_roles 
ADD CONSTRAINT fk_user_roles_profiles 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;