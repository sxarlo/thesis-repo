-- =============================================
-- SETUP ADMIN ACCOUNTS FOR CASHIER AND ACCOUNTING
-- =============================================
-- Run this in Supabase SQL Editor AFTER creating
-- auth.users entries via the Supabase Dashboard.
--
-- Steps:
-- 1. Go to Auth > Users in Supabase Dashboard
-- 2. Create two users:
--    - Cashier:  cashier@ceu.edu.ph  (password: your choice)
--    - Accounting: accounting@ceu.edu.ph (password: your choice)
-- 3. Copy the UUID for each user
-- 4. Replace the placeholder UUIDs below
-- 5. Run this script in SQL Editor
-- =============================================

-- First, verify what currently exists
SELECT id, username, email, display_name, role, department, is_active
FROM admin_profiles
ORDER BY department;

-- =============================================
-- REPLACE THESE UUIDs WITH ACTUAL VALUES
-- from Auth > Users in Supabase Dashboard
-- =============================================
-- Cashier auth user UUID:   REPLACE_ME_1
-- Accounting auth user UUID: REPLACE_ME_2

-- =============================================
-- INSERT CASHIER ADMIN PROFILE
-- =============================================
-- Only run this AFTER replacing the UUID above
INSERT INTO admin_profiles (id, email, username, display_name, role, department, is_active)
VALUES (
  '41b31a14-ae20-4cc2-a6e3-016abefeb08c',                -- Must match auth.users UUID
  'cashier@ceu.edu.ph',          -- Must match auth.users email
  'cashier',                     -- Login username
  'Maria Santos',                -- Display name
  'Cashier Administrator',       -- Role
  'cashier',                     -- Department
  true                           -- Active
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  is_active = EXCLUDED.is_active;

-- =============================================
-- INSERT ACCOUNTING ADMIN PROFILE
-- =============================================
-- Only run this AFTER replacing the UUID above
INSERT INTO admin_profiles (id, email, username, display_name, role, department, is_active)
VALUES (
  'e069f536-d2ff-46ea-981e-05a33be6dc0d',                -- Must match auth.users UUID
  'accounting@ceu.edu.ph',       -- Must match auth.users email
  'accounting',                  -- Login username
  'Pedro Reyes',                 -- Display name
  'Accounting Administrator',    -- Role
  'accounting',                  -- Department
  true                           -- Active
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  is_active = EXCLUDED.is_active;

-- =============================================
-- VERIFY ALL THREE ACCOUNTS
-- =============================================
SELECT id, username, email, display_name, role, department, is_active
FROM admin_profiles
ORDER BY department;
