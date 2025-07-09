-- Add admin role for all users who don't already have it
INSERT INTO user_roles (user_id, role)
SELECT up.user_id, 'admin'::user_role
FROM user_profiles up
LEFT JOIN user_roles ur ON up.user_id = ur.user_id AND ur.role = 'admin'
WHERE ur.user_id IS NULL;