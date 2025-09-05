import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const timezone = searchParams.get('timezone')

  if (!timezone) {
    return NextResponse.json({ error: 'Missing timezone parameter' }, { status: 400 })
  }

  try {
    // Try HTTPS first
    let response = await fetch(`https://worldtimeapi.org/api/timezone/${timezone}`, {
      headers: {
        'User-Agent': 'NomadNow/1.0'
      }
    })

    // If HTTPS fails, try HTTP as fallback
    if (!response.ok) {
      response = await fetch(`http://worldtimeapi.org/api/timezone/${timezone}`, {
        headers: {
          'User-Agent': 'NomadNow/1.0'
        }
      })
    }

    if (!response.ok) {
      throw new Error(`Time API request failed with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Time API error:', error)
    
    // Return fallback data instead of error
    const now = new Date()
    const fallbackData = {
      datetime: now.toISOString(),
      timezone: timezone,
      utc_offset: now.getTimezoneOffset() / -60,
      fallback: true
    }
    
    return NextResponse.json(fallbackData)
  }
}
