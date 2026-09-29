const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://klpykytinxmsdjkvugiu.supabase.co';
const supabaseAnonKey = 'sb_publishable_JjhOfJX1OBsX8CMzZ660Rw_6eE4LIyn';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('part_models').select('*');
    if (error) {
      console.error('Supabase Query Error:', error);
    } else {
      console.log('Supabase Query Success! Data count:', data ? data.length : 0);
      console.log('Data:', data);
    }
  } catch (err) {
    console.error('Catch error:', err);
  }
}

testConnection();
