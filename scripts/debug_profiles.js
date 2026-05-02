const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugProfiles() {
  console.log('Fetching all columns from profiles...');
  const { data, error } = await supabase.from('profiles').select('*');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\nProfiles Data:');
  console.table(data.map(u => ({
    id: u.id,
    name: u.full_name,
    role: u.role,
    status: u.status,
    completed: u.is_profile_completed
  })));
}

debugProfiles();
