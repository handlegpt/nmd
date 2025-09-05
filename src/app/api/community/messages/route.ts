import { NextRequest, NextResponse } from 'next/server'
import { 
  getCommunityMessages, 
  sendCommunityMessage,
  type GetMessagesOptions 
} from '@/lib/communityChatApi'
import { handleError, createSuccessResponse, generateRequestId } from '@/lib/errorHandler'
import { logInfo } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    const { searchParams } = new URL(request.url)
    
    const options: GetMessagesOptions = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      message_type: searchParams.get('type') || undefined,
      location: searchParams.get('location') || undefined,
      search: searchParams.get('search') || undefined,
      parent_message_id: searchParams.get('parent_message_id') || undefined
    }

    logInfo('Fetching community messages', options, 'CommunityMessagesAPI')

    const result = await getCommunityMessages(options)
    
    return NextResponse.json(createSuccessResponse(result, requestId))
  } catch (error) {
    return handleError(error, 'CommunityMessagesAPI', requestId)
  }
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    const body = await request.json()
    const { content, message_type, location, tags, parent_message_id } = body

    // 基本验证
    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    if (!message_type || !['general', 'question', 'info', 'help'].includes(message_type)) {
      return NextResponse.json(
        { error: 'Invalid message type' },
        { status: 400 }
      )
    }

    logInfo('Sending community message', { message_type, hasParent: !!parent_message_id }, 'CommunityMessagesAPI')

    const message = await sendCommunityMessage({
      content: content.trim(),
      message_type,
      location,
      tags,
      parent_message_id
    })
    
    return NextResponse.json(createSuccessResponse(message, requestId))
  } catch (error) {
    return handleError(error, 'CommunityMessagesAPI', requestId)
  }
}
