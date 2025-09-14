import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logInfo, logError } from '@/lib/logger'

// 检查环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables for Supabase')
}

const supabase = supabaseUrl && supabaseServiceKey ? createClient(
  supabaseUrl,
  supabaseServiceKey
) : null

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      )
    }
    
    logInfo('Setting up meetups tables', {}, 'SetupMeetupsAPI')
    
    // 创建 meetups 表的 SQL 语句
    const createTablesSQL = `
      -- 删除相关表（按依赖顺序）
      DROP TABLE IF EXISTS meetup_participants CASCADE;
      DROP TABLE IF EXISTS meetup_reviews CASCADE;
      DROP TABLE IF EXISTS meetup_activities CASCADE;
      DROP TABLE IF EXISTS meetups CASCADE;

      -- 创建 meetups 表
      CREATE TABLE meetups (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          organizer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          location VARCHAR(255) NOT NULL,
          meeting_time TIMESTAMP WITH TIME ZONE NOT NULL,
          max_participants INTEGER DEFAULT 10,
          current_participants INTEGER DEFAULT 1,
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed', 'full')),
          meetup_type VARCHAR(20) DEFAULT 'coffee' CHECK (meetup_type IN ('coffee', 'work', 'social', 'other')),
          tags TEXT[] DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 创建 meetup_participants 表
      CREATE TABLE meetup_participants (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          meetup_id UUID REFERENCES meetups(id) ON DELETE CASCADE NOT NULL,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          status VARCHAR(20) DEFAULT 'joined' CHECK (status IN ('joined', 'left', 'removed')),
          joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          left_at TIMESTAMP WITH TIME ZONE,
          
          -- 防止重复参与者
          UNIQUE(meetup_id, user_id)
      );

      -- 创建 meetup_reviews 表
      CREATE TABLE meetup_reviews (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          meetup_id UUID REFERENCES meetups(id) ON DELETE CASCADE NOT NULL,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          review TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          
          -- 每个用户只能对每个聚会评价一次
          UNIQUE(meetup_id, user_id)
      );

      -- 创建索引
      CREATE INDEX idx_meetups_organizer_id ON meetups(organizer_id);
      CREATE INDEX idx_meetups_meeting_time ON meetups(meeting_time);
      CREATE INDEX idx_meetups_status ON meetups(status);
      CREATE INDEX idx_meetups_meetup_type ON meetups(meetup_type);
      CREATE INDEX idx_meetups_location ON meetups(location);

      CREATE INDEX idx_meetup_participants_meetup_id ON meetup_participants(meetup_id);
      CREATE INDEX idx_meetup_participants_user_id ON meetup_participants(user_id);
      CREATE INDEX idx_meetup_participants_status ON meetup_participants(status);

      CREATE INDEX idx_meetup_reviews_meetup_id ON meetup_reviews(meetup_id);
      CREATE INDEX idx_meetup_reviews_user_id ON meetup_reviews(user_id);

      -- 启用行级安全
      ALTER TABLE meetups ENABLE ROW LEVEL SECURITY;
      ALTER TABLE meetup_participants ENABLE ROW LEVEL SECURITY;
      ALTER TABLE meetup_reviews ENABLE ROW LEVEL SECURITY;
    `

    // 执行创建表的 SQL
    const { error: createError } = await supabase.rpc('exec_sql', {
      query: createTablesSQL
    })

    if (createError) {
      logError('Error creating meetups tables', createError, 'SetupMeetupsAPI')
      return NextResponse.json(
        { error: 'Failed to create meetups tables', details: createError.message },
        { status: 500 }
      )
    }

    // 创建 RLS 策略
    const createPoliciesSQL = `
      -- 创建基本的 RLS 策略
      CREATE POLICY "Users can view active meetups" ON meetups
          FOR SELECT USING (status = 'active');

      CREATE POLICY "Users can create meetups" ON meetups
          FOR INSERT WITH CHECK (auth.uid() = organizer_id);

      CREATE POLICY "Organizers can update their meetups" ON meetups
          FOR UPDATE USING (auth.uid() = organizer_id);

      CREATE POLICY "Users can view meetup participants" ON meetup_participants
          FOR SELECT USING (true);

      CREATE POLICY "Users can join meetups" ON meetup_participants
          FOR INSERT WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "Users can leave meetups" ON meetup_participants
          FOR UPDATE USING (auth.uid() = user_id);

      CREATE POLICY "Users can view meetup reviews" ON meetup_reviews
          FOR SELECT USING (true);

      CREATE POLICY "Users can create meetup reviews" ON meetup_reviews
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    `

    const { error: policiesError } = await supabase.rpc('exec_sql', {
      query: createPoliciesSQL
    })

    if (policiesError) {
      logError('Error creating RLS policies', policiesError, 'SetupMeetupsAPI')
      // 策略创建失败不是致命错误，继续执行
    }

    // 插入一些测试数据
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (users && users.length > 0) {
      const testMeetups = [
        {
          organizer_id: users[0].id,
          title: 'Coffee Chat in Tokyo',
          description: 'Let\'s grab a coffee and chat about digital nomad life!',
          location: 'Shibuya, Tokyo',
          meeting_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2小时后
          max_participants: 4,
          meetup_type: 'coffee',
          tags: ['coffee', 'casual', 'networking']
        },
        {
          organizer_id: users[0].id,
          title: 'Co-working Session',
          description: 'Join me for a productive co-working session at a local cafe',
          location: 'Shinjuku, Tokyo',
          meeting_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1天后
          max_participants: 6,
          meetup_type: 'work',
          tags: ['work', 'productivity', 'coworking']
        }
      ]

      const { data: insertedMeetups, error: insertError } = await supabase
        .from('meetups')
        .insert(testMeetups)
        .select()

      if (insertError) {
        logError('Error inserting test meetups', insertError, 'SetupMeetupsAPI')
      }
    }

    // 检查创建结果
    const { data: meetupsCount } = await supabase
      .from('meetups')
      .select('*', { count: 'exact', head: true })

    const { data: participantsCount } = await supabase
      .from('meetup_participants')
      .select('*', { count: 'exact', head: true })

    const result = {
      success: true,
      message: 'Meetups tables created successfully',
      meetupsCount: meetupsCount?.length || 0,
      participantsCount: participantsCount?.length || 0
    }

    logInfo('Meetups tables setup completed', result, 'SetupMeetupsAPI')

    return NextResponse.json(result)

  } catch (error) {
    logError('Unexpected error in setup meetups API', error, 'SetupMeetupsAPI')
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
