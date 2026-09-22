-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/cyozpbmdqtdjerqmvkkz/sql)
UPDATE admin_profiles
SET display_name = 'Registrar Staff'
WHERE username = 'admin';

-- Verify
SELECT id, username, display_name, email, role, department
FROM admin_profiles;
