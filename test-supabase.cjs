const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const sb = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: authData, error: authError } = await sb.auth.signInWithPassword({
    email: 'vendor@jayapresisi.com',
    password: 'Vendor123!'
  });
  
  if (authError) {
    console.error('Login error:', authError);
    return;
  }
  
  console.log('Logged in as:', authData.user.id);
  
  const { data, error } = await sb
        .from('users')
        .select('*, vendors(name)')
        .eq('auth_uid', authData.user.id)
        .single();
        
  console.log('Profile Data:', data);
  console.log('Profile Error:', error);
}

test();
