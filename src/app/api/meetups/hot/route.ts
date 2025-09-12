import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logError } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }

    // Fetch hot meetups with basic information
    const { data: meetups, error } = await supabase
      .from('meetups')
      .select(`
        id,
        title,
        description,
        city,
        meetup_type,
        scheduled_date,
        max_participants,
        current_participants,
        creator_id,
        status,
        created_at
      `)
      .eq('status', 'active')
      .gte('scheduled_date', new Date().toISOString())
      .order('current_participants', { ascending: false })
      .limit(10)

    if (error) {
      logError('Failed to fetch meetups data', error, 'HotMeetupsAPI')
      return NextResponse.json(
        { error: 'Failed to fetch meetups' },
        { status: 500 }
      )
    }

    // Get organizer information for each meetup
    const organizerIds = [...new Set(meetups.map((m: any) => m.creator_id).filter(Boolean))]
    const { data: organizers } = await supabase
      .from('users')
      .select('id, name, avatar_url')
      .in('id', organizerIds)

    const organizerMap = new Map(organizers?.map((o: any) => [o.id, o]) || [])

    // Format response
    const formattedMeetups = meetups.map((meetup: any) => {
      const organizer = organizerMap.get(meetup.creator_id)
      
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
        createdAt: meetup.created_at
      }
    })

    return NextResponse.json({
      success: true,
      data: formattedMeetups
    })

  } catch (error) {
    logError('Unexpected error in hot meetups API', error, 'HotMeetupsAPI')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
