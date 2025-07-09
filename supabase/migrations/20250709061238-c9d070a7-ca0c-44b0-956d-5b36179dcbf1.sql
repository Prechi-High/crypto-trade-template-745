
-- First, let's insert the admin user directly into the auth.users table
-- Note: In production, you should use Supabase's auth.admin.createUser() API
-- But for this setup, we'll create the user record and profile

-- Create user profile for the admin
INSERT INTO public.user_profiles (
  user_id,
  full_name,
  email,
  created_by
) VALUES (
  gen_random_uuid(),
  'Admin User',
  'Adminprechi@gmail.com',
  NULL
);

-- Get the user_id we just created for the admin user
-- Create admin role for this user
WITH admin_user AS (
  SELECT id FROM public.user_profiles WHERE email = 'Adminprechi@gmail.com'
)
INSERT INTO public.user_roles (
  user_id,
  role
) 
SELECT id, 'admin'::user_role 
FROM admin_user;

-- Create financial data for the admin user
WITH admin_user AS (
  SELECT id FROM public.user_profiles WHERE email = 'Adminprechi@gmail.com'
)
INSERT INTO public.user_financials (
  user_profile_id,
  total_balance,
  invested_amount,
  profit_amount,
  credit_score
)
SELECT id, 0, 0, 0, 660
FROM admin_user;
