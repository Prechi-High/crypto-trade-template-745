-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view financials" ON public.user_financials;

-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_profile_id()
RETURNS uuid AS $$
  SELECT id FROM public.user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND email = 'referral391@gmail.com'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_referred_users()
RETURNS TABLE(profile_id uuid) AS $$
  SELECT id FROM public.user_profiles 
  WHERE referred_by = (
    SELECT id FROM public.user_profiles WHERE user_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Recreate policies using security definer functions
CREATE POLICY "Admins can view profiles" 
ON public.user_profiles 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::user_role) AND (
    public.is_super_admin() OR 
    id IN (SELECT profile_id FROM public.get_referred_users()) OR 
    user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view financials" 
ON public.user_financials 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::user_role) AND (
    public.is_super_admin() OR 
    user_profile_id IN (SELECT profile_id FROM public.get_referred_users()) OR 
    user_profile_id = public.get_current_user_profile_id()
  )
);