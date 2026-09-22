const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cyozpbmdqtdjerqmvkkz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5b3pwYm1kcXRkamVycW12a2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzOTgwOTAsImV4cCI6MjEwNDk3NDA5MH0.M3x0X9pH0JgsoPV2m8Qp0k293QurSveBjhzOshCvUOE';

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('Current admin_profiles:');
  const { data: before, error: e1 } = await supabase.from('admin_profiles').select('id, username, display_name, email, role, department');
  if (e1) { console.error(e1); return; }
  console.table(before);

  const { error } = await supabase
    .from('admin_profiles')
    .update({ display_name: 'Registrar Staff' })
    .eq('username', 'admin');

  if (error) { console.error('Update failed:', error); return; }

  console.log('\nUpdated! New data:');
  const { data: after } = await supabase.from('admin_profiles').select('id, username, display_name, email, role, department');
  console.table(after);
})();
