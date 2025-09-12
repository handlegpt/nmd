import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logInfo, logError } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    logInfo('Fetching hot meetups data', {}, 'HotMeetupsAPI')
    
    // 检查Supabase客户端是否可用
    if (!supabase) {
      logError('Supabase client not available', new Error('Supabase client is null'), 'HotMeetupsAPI')
      return NextResponse.json(
        { success: false, message: 'Database not available', data: [] },
        { status: 503 }
      )
    }
    
    // 检查是否有meetups表，如果没有则返回模拟数据
    const { data: meetupsTable, error: tableError } = await supabase
      .from('meetups')
      .select('id')
      .limit(1)

    if (tableError) {
      logInfo('Meetups table not found, returning simulated data', {}, 'HotMeetupsAPI')
      
      // 返回基于用户数据的模拟聚会
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('current_city, name, profession, interests')
        .not('current_city', 'is', null)
        .neq('current_city', 'Unknown Location')
        .limit(20)

      if (usersError) {
        logError('Failed to fetch users for simulated meetups', usersError, 'HotMeetupsAPI')
        return NextResponse.json(
          { error: 'Failed to fetch meetups data' },
          { status: 500 }
        )
      }

      // 基于用户数据生成模拟聚会
      const simulatedMeetups = generateSimulatedMeetups(users || [])
      
      return NextResponse.json({
        success: true,
        data: simulatedMeetups,
        timestamp: new Date().toISOString(),
        note: 'Simulated data - meetups table not implemented yet'
      })
    }

    // 如果meetups表存在，获取真实数据
    const { data: meetups, error } = await supabase
      .from('meetups')
      .select(`
        id,
        title,
        description,
        city,
        meetup_type,
        meeting_time as scheduled_date,
        max_participants,
        current_participants,
        organizer_id,
        status,
        created_at
      `)
      .eq('status', 'active')
      .gte('meeting_time', new Date().toISOString())
      .order('current_participants', { ascending: false })
      .limit(10)

    if (error) {
      logError('Failed to fetch meetups data', error, 'HotMeetupsAPI')
      return NextResponse.json(
        { error: 'Failed to fetch meetups data' },
        { status: 500 }
      )
    }

    // 获取组织者信息
    const organizerIds = meetups?.map((m: any) => m.organizer_id).filter(Boolean) || []
    const { data: organizers } = await supabase
      .from('users')
      .select('id, name, avatar_url')
      .in('id', organizerIds)

    // 合并数据
    const result = meetups?.map((meetup: any) => {
      const organizer = organizers?.find((o: any) => o.id === meetup.organizer_id)
      return {
        id: meetup.id,
        title: meetup.title,
        description: meetup.description,
        city: meetup.city,
        type: meetup.meetup_type,
        scheduledDate: meetup.scheduled_date,
        maxParticipants: meetup.max_participants,
        currentParticipants: meetup.current_participants,
        organizer: organizer ? {
          name: organizer.name,
          avatar: organizer.avatar_url
        } : null,
        status: meetup.status,
        createdAt: meetup.created_at,
        hotness: Math.min(100, Math.round((meetup.current_participants / Math.max(meetup.max_participants, 1)) * 100))
      }
    }) || []

    logInfo('Hot meetups data fetched successfully', { count: result.length }, 'HotMeetupsAPI')
    
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logError('Unexpected error in hot meetups API', error, 'HotMeetupsAPI')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 生成模拟聚会数据
function generateSimulatedMeetups(users: any[]) {
  const meetupTypes = ['coffee', 'coworking', 'networking', 'social', 'workshop']
  const cities = [...new Set(users.map(u => u.current_city).filter(Boolean))]
  
  return cities.slice(0, 5).map((city, index) => {
    const cityUsers = users.filter(u => u.current_city === city)
    const organizer = cityUsers[0]
    const type = meetupTypes[index % meetupTypes.length]
    
    return {
      id: `simulated-${city.toLowerCase().replace(/\s+/g, '-')}-${index}`,
      title: generateMeetupTitle(type, city),
      description: generateMeetupDescription(type, city),
      city: city,
      type: type,
      scheduledDate: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 15,
      currentParticipants: Math.min(15, Math.floor(Math.random() * cityUsers.length) + 3),
      organizer: {
        name: organizer?.name || 'Anonymous',
        avatar: organizer?.avatar_url || null
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      hotness: Math.floor(Math.random() * 40) + 60 // 60-100% 热度
    }
  })
}

function generateMeetupTitle(type: string, city: string): string {
  const titles = {
    coffee: `☕ Coffee Chat in ${city}`,
    coworking: `🧑‍💻 Coworking Session in ${city}`,
    networking: `🤝 Networking Event in ${city}`,
    social: `🎉 Social Meetup in ${city}`,
    workshop: `📚 Workshop in ${city}`
  }
  return titles[type as keyof typeof titles] || `Meetup in ${city}`
}

function generateMeetupDescription(type: string, city: string): string {
  const descriptions = {
    coffee: `Join us for a casual coffee chat and networking in ${city}. Perfect for meeting fellow digital nomads!`,
    coworking: `Productive coworking session in ${city}. Bring your laptop and let's work together!`,
    networking: `Professional networking event in ${city}. Connect with like-minded professionals.`,
    social: `Fun social meetup in ${city}. Let's explore the city together and make new friends!`,
    workshop: `Educational workshop in ${city}. Learn something new and meet interesting people.`
  }
  return descriptions[type as keyof typeof descriptions] || `Join us for a great meetup in ${city}!`
}
