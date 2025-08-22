const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Verify Supabase configuration
async function verifySupabaseConfig() {
  console.log('🔍 Verifying Supabase configuration...\n');

  // Check environment variables
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('📋 Environment Variables Check:');
  console.log(`   EXPO_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`   EXPO_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? '✅ Set' : '❌ Missing'}`);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('\n❌ Missing required environment variables!');
    console.log('Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file');
    return;
  }

  // Test connection
  console.log('\n🔗 Testing Supabase connection...');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Connection failed:', error.message);
      
      if (error.message.includes('relation "users" does not exist')) {
        console.log('\n💡 Database tables not found. Please run the SQL schema script in Supabase SQL Editor.');
        console.log('   File: scripts/supabase-schema.sql');
      } else if (error.message.includes('JWT')) {
        console.log('\n💡 Authentication error. Please check your API keys.');
      }
      return;
    }

    console.log('✅ Successfully connected to Supabase!');

    // Test all tables
    const tables = ['users', 'posts', 'comments', 'messages', 'notifications', 'user_locations'];
    console.log('\n📊 Testing database tables:');

    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (tableError) {
          console.log(`   ${table}: ❌ ${tableError.message}`);
        } else {
          console.log(`   ${table}: ✅ Accessible`);
        }
      } catch (err) {
        console.log(`   ${table}: ❌ ${err.message}`);
      }
    }

    // Test storage
    console.log('\n📁 Testing storage:');
    try {
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      
      if (storageError) {
        console.log('   Storage: ❌', storageError.message);
      } else {
        const uploadsBucket = buckets.find(bucket => bucket.name === 'uploads');
        if (uploadsBucket) {
          console.log('   uploads bucket: ✅ Found');
        } else {
          console.log('   uploads bucket: ❌ Not found - please create it in Supabase Storage');
        }
      }
    } catch (err) {
      console.log('   Storage: ❌', err.message);
    }

    console.log('\n🎉 Supabase configuration verification completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. If any tables are missing, run scripts/supabase-schema.sql in Supabase SQL Editor');
    console.log('   2. If uploads bucket is missing, create it in Supabase Storage');
    console.log('   3. Restart your application to use the real database');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run verification
verifySupabaseConfig();
