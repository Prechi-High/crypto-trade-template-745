-- Add referral tracking to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN referred_by uuid REFERENCES public.user_profiles(id);

-- Create index for better query performance
CREATE INDEX idx_user_profiles_referred_by ON public.user_profiles(referred_by);

-- Update RLS policies for admin referral system
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all financials" ON public.user_financials;

-- Admins can view all profiles (for super admin) OR their referred users
CREATE POLICY "Admins can view profiles" 
ON public.user_profiles 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::user_role) AND (
    -- Super admin can see all
    auth.uid() IN (
      SELECT user_id FROM public.user_profiles 
      WHERE email = 'referral391@gmail.com'
    )
    OR 
    -- Regular admin can see their referred users
    referred_by = (
      SELECT id FROM public.user_profiles 
      WHERE user_id = auth.uid()
    )
    OR
    -- Admin can see their own profile
    user_id = auth.uid()
  )
);

-- Admins can view financials for their referred users
CREATE POLICY "Admins can view financials" 
ON public.user_financials 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::user_role) AND (
    -- Super admin can see all
    auth.uid() IN (
      SELECT user_id FROM public.user_profiles 
      WHERE email = 'referral391@gmail.com'
    )
    OR
    -- Regular admin can see their referred users' financials
    user_profile_id IN (
      SELECT id FROM public.user_profiles 
      WHERE referred_by = (
        SELECT id FROM public.user_profiles 
        WHERE user_id = auth.uid()
      )
    )
    OR
    -- Admin can see their own financials
    user_profile_id = (
      SELECT id FROM public.user_profiles 
      WHERE user_id = auth.uid()
    )
  )
);

-- Update the handle_new_user function to support referrals
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Insert user profile with referral tracking
  INSERT INTO public.user_profiles (
    user_id,
    email,
    full_name,
    username,
    referred_by
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    CASE 
      WHEN NEW.raw_user_meta_data->>'referred_by' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'referred_by')::uuid
      ELSE NULL
    END
  );

  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  -- Create default financial data
  INSERT INTO public.user_financials (
    user_profile_id,
    total_balance,
    invested_amount,
    profit_amount,
    credit_score
  ) VALUES (
    (SELECT id FROM public.user_profiles WHERE user_id = NEW.id),
    0,
    0,
    0,
    660
  );

  RETURN NEW;
END;
$function$;