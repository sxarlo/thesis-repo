/**
 * SETUP ADMIN ACCOUNTS
 * 
 * This script checks if all three admin accounts exist in admin_profiles
 * and reports what's missing.
 * 
 * Usage: node scripts/check-admin-accounts.cjs
 * 
 * NOTE: This script uses the anon key, which can only read admin_profiles
 * if RLS allows it. It CANNOT create auth.users entries — those must be
 * created via the Supabase Dashboard.
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cyozpbmdqtdjerqmvkkz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5b3pwYm1kcXRkamVycW12a2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzOTgwOTAsImV4cCI6MjEwNDk3NDA5MH0.M3x0X9pH0JgsoPV2m8Qp0k293QurSveBjhzOshCvUOE';

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('=== Admin Account Status Check ===\n');

  // Check admin_profiles
  const { data: profiles, error } = await supabase
    .from('admin_profiles')
    .select('id, username, email, display_name, role, department, is_active');

  if (error) {
    console.error('ERROR reading admin_profiles:', error.message);
    return;
  }

  console.log('Current admin_profiles records:');
  if (profiles.length === 0) {
    console.log('  (none)');
  } else {
    console.table(profiles);
  }

  // Check which accounts exist
  const accounts = {
    registrar: profiles.find(p => p.department === 'registrar'),
    cashier: profiles.find(p => p.department === 'cashier'),
    accounting: profiles.find(p => p.department === 'accounting'),
  };

  console.log('\n=== Account Status ===\n');

  const checks = [
    { name: 'Registrar', key: 'registrar', username: 'admin' },
    { name: 'Cashier', key: 'cashier', username: 'cashier' },
    { name: 'Accounting', key: 'accounting', username: 'accounting' },
  ];

  let allGood = true;

  for (const check of checks) {
    const profile = accounts[check.key];
    if (profile) {
      console.log(`✅ ${check.name} admin:`);
      console.log(`   username: ${profile.username}`);
      console.log(`   email: ${profile.email}`);
      console.log(`   department: ${profile.department}`);
      console.log(`   is_active: ${profile.is_active}`);
      console.log(`   Login: username="${profile.username}" + password from auth.users\n`);
    } else {
      console.log(`❌ ${check.name} admin: MISSING`);
      console.log(`   Required username: ${check.username}`);
      console.log(`   Action needed: Create auth user + admin_profiles record\n`);
      allGood = false;
    }
  }

  if (allGood) {
    console.log('All three admin accounts are configured!');
  } else {
    console.log('=== SETUP INSTRUCTIONS ===\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/cyozpbmdqtdjerqmvkkz/auth/users');
    console.log('2. Create auth users for each missing account:');
    console.log('   - Cashier:  email=cashier@ceu.edu.ph, password=(your choice), auto-confirm=yes');
    console.log('   - Accounting: email=accounting@ceu.edu.ph, password=(your choice), auto-confirm=yes');
    console.log('3. Copy the UUID for each new auth user');
    console.log('4. Edit scripts/setup-admin-accounts.sql with the UUIDs');
    console.log('5. Run the SQL in Supabase SQL Editor');
    console.log('6. Run this script again to verify');
  }
})();
