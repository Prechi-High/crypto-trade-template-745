-- Add super_admin to the user_role enum
ALTER TYPE user_role ADD VALUE 'super_admin';

-- Create super admin user profile
INSERT INTO public.user_profiles (
  user_id,
  full_name,
  email,
  created_by
) VALUES (
  gen_random_uuid(),
  'Super Admin User',
  'Referral391@gmail.com',
  NULL
);

-- Create super admin role for the new user
WITH super_admin_user AS (
  SELECT id FROM public.user_profiles WHERE email = 'Referral391@gmail.com'
)
INSERT INTO public.user_roles (
  user_id,
  role
) 
SELECT id, 'super_admin'::user_role 
FROM super_admin_user;

-- Create financial data for the super admin user
WITH super_admin_user AS (
  SELECT id FROM public.user_profiles WHERE email = 'Referral391@gmail.com'
)
INSERT INTO public.user_financials (
  user_profile_id,
  total_balance,
  invested_amount,
  profit_amount,
  credit_score
)
SELECT id, 0, 0, 0, 660
FROM super_admin_user;

-- Update RLS policies to include super admin access
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can create profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all financials" ON public.user_financials;
DROP POLICY IF EXISTS "Admins can create financials" ON public.user_financials;
DROP POLICY IF EXISTS "Admins can update financials" ON public.user_financials;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- Create new policies that include super admin access
CREATE POLICY "Super admins and admins can view all profiles" 
ON public.user_profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::user_role) OR has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Super admins and admins can create profiles" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'super_admin'::user_role) OR has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Super admins and admins can update profiles" 
ON public.user_profiles 
FOR UPDATE 
USING (has_role(auth.uid(), 'super_admin'::user_role) OR has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Super admins and admins can view all financials" 
ON public.user_financials 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::user_role) OR has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Super admins and admins can create financials" 
ON public.user_financials 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'super_admin'::user_role) OR has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Super admins and admins can update financials" 
ON public.user_financials 
FOR UPDATE 
USING (has_role(auth.uid(), 'super_admin'::user_role) OR has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Super admins can manage all roles, admins can manage user roles" 
ON public.user_roles 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::user_role) OR 
  (has_role(auth.uid(), 'admin'::user_role) AND role = 'user'::user_role)
);

CREATE POLICY "Super admins and admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::user_role) OR has_role(auth.uid(), 'admin'::user_role));