-- Make user with email "referral393@gmail.com" an admin
INSERT INTO public.user_roles (user_id, role)
SELECT up.user_id, 'admin'::user_role
FROM public.user_profiles up
WHERE up.email = 'referral393@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = up.user_id AND ur.role = 'admin'
  );