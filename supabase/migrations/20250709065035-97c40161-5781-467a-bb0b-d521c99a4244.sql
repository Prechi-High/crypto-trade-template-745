-- Create another admin user profile
INSERT INTO public.user_profiles (
  user_id,
  full_name,
  email,
  created_by
) VALUES (
  gen_random_uuid(),
  'High Admin User',
  'highprechi@gmail.com',
  NULL
);

-- Create admin role for the new user
WITH admin_user AS (
  SELECT id FROM public.user_profiles WHERE email = 'highprechi@gmail.com'
)
INSERT INTO public.user_roles (
  user_id,
  role
) 
SELECT id, 'admin'::user_role 
FROM admin_user;

-- Create financial data for the new admin user
WITH admin_user AS (
  SELECT id FROM public.user_profiles WHERE email = 'highprechi@gmail.com'
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