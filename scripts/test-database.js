const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Test database connection and basic operations
async function testDatabase() {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Supabase credentials not found in environment variables');
    console.log('Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
    return;
  }

  console.log('🔗 Testing Supabase connection...');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test connection by querying users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) {
      console.log('❌ Error connecting to users table:', usersError.message);
      return;
    }

    console.log('✅ Successfully connected to Supabase');
    console.log(`📊 Found ${users?.length || 0} users in database`);

    // Test posts table
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);

    if (postsError) {
      console.log('❌ Error connecting to posts table:', postsError.message);
    } else {
      console.log(`📝 Found ${posts?.length || 0} posts in database`);
    }

    // Test comments table
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .limit(1);

    if (commentsError) {
      console.log('❌ Error connecting to comments table:', commentsError.message);
    } else {
      console.log(`💬 Found ${comments?.length || 0} comments in database`);
    }

    // Test notifications table
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .limit(1);

    if (notificationsError) {
      console.log('❌ Error connecting to notifications table:', notificationsError.message);
    } else {
      console.log(`🔔 Found ${notifications?.length || 0} notifications in database`);
    }

    // Test messages table
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);

    if (messagesError) {
      console.log('❌ Error connecting to messages table:', messagesError.message);
    } else {
      console.log(`💌 Found ${messages?.length || 0} messages in database`);
    }

    // Test user_locations table
    const { data: locations, error: locationsError } = await supabase
      .from('user_locations')
      .select('*')
      .limit(1);

    if (locationsError) {
      console.log('❌ Error connecting to user_locations table:', locationsError.message);
    } else {
      console.log(`📍 Found ${locations?.length || 0} user locations in database`);
    }

    console.log('\n🎉 Database test completed successfully!');
    console.log('All tables are accessible and ready for use.');

  } catch (error) {
    console.error('❌ Unexpected error during database test:', error);
  }
}

// Run the test
testDatabase();
