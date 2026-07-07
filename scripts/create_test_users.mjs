import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://osbpdjlywgydidzurpsb.supabase.co';
const supabaseKey = 'sb_publishable_p8e6J1Hb34XvSCM8vFSfMw_IKObb-6a';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUsers() {
  const users = [
    { email: 'tester1@prepentrance.com', password: 'TestPassword123!', name: 'Tester One' },
    { email: 'tester2@prepentrance.com', password: 'TestPassword123!', name: 'Tester Two' },
    { email: 'tester3@prepentrance.com', password: 'TestPassword123!', name: 'Tester Three' }
  ];

  console.log('Creating test users...');
  
  for (const user of users) {
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          full_name: user.name,
          user_type: 'student'
        }
      }
    });

    if (error) {
      // If user already exists, it might throw an error depending on Supabase settings
      console.log(`Failed to create ${user.email}: ${error.message}`);
    } else {
      console.log(`Successfully created ${user.email}`);
    }
  }
  
  console.log('\n--- Test Credentials ---');
  users.forEach(u => console.log(`Email: ${u.email} | Password: ${u.password}`));
}

createTestUsers();
