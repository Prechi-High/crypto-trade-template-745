-- Add is_admin column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;

-- Update existing admin users to have is_admin = true
UPDATE public.user_profiles 
SET is_admin = true 
WHERE user_id IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
);