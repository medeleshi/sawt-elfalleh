const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  console.log('Checking profiles table...');
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, status')
    .limit(10);

  if (error) {
    console.error('Error fetching profiles:', error);
    if (error.message.includes('column "status" does not exist')) {
      console.error('\n⚠️ ⚠️ ⚠️ IMPORTANT: The "status" column DOES NOT EXIST yet. You must run the SQL migration in Supabase Dashboard! ⚠️ ⚠️ ⚠️');
    }
    return;
  }

  console.log('\nUsers found:');
  console.table(data);
  
  const suspended = data.filter(u => u.status === 'suspended');
  if (suspended.length === 0) {
    console.log('\nNo suspended users found. Please try to ban a user in the Admin Dashboard first.');
  } else {
    console.log(`\nFound ${suspended.length} suspended user(s).`);
  }
}

checkUsers();
