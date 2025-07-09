-- Add username field to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN username TEXT UNIQUE;

-- Create index for better performance on username lookups
CREATE INDEX idx_user_profiles_username ON public.user_profiles(username);