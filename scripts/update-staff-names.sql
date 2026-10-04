-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/cyozpbmdqtdjerqmvkkz/sql)
-- Data-only change: updates display_name for Cashier and Accounting admins.
-- Does NOT touch auth, emails, passwords, IDs, roles, departments, or RLS.
UPDATE admin_profiles
SET display_name = 'Cashier Staff'
WHERE username = 'cashier';

UPDATE admin_profiles
SET display_name = 'Accounting Staff'
WHERE username = 'accounting';

-- Verify (Registrar must remain unchanged as 'Registrar Staff')
SELECT id, username, display_name, email, role, department, is_active
FROM admin_profiles
ORDER BY department;
