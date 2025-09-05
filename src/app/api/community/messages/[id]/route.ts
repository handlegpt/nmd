import { NextRequest, NextResponse } from 'next/server'
import { 
  editCommunityMessage, 
  deleteCommunityMessage,
  toggleMessageLike,
  getMessageReplies,
  sendMessageReply
} from '@/lib/communityChatApi'
import { handleError, createSuccessResponse, generateRequestId } from '@/lib/errorHandler'
import { logInfo } from '@/lib/logger'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId()
  
  try {
    const body = await request.json()
    const { content } = body

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    logInfo('Editing community message', { messageId: params.id }, 'CommunityMessageAPI')

    const message = await editCommunityMessage(params.id, content.trim())
    
    return NextResponse.json(createSuccessResponse(message, requestId))
  } catch (error) {
    return handleError(error, 'CommunityMessageAPI', requestId)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId()
  
  try {
    logInfo('Deleting community message', { messageId: params.id }, 'CommunityMessageAPI')

    await deleteCommunityMessage(params.id)
    
    return NextResponse.json(createSuccessResponse({ success: true }, requestId))
  } catch (error) {
    return handleError(error, 'CommunityMessageAPI', requestId)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId()
  
  try {
    const body = await request.json()
    const { action, content } = body

    switch (action) {
      case 'like':
        logInfo('Toggling message like', { messageId: params.id }, 'CommunityMessageAPI')
        const likeResult = await toggleMessageLike(params.id)
        return NextResponse.json(createSuccessResponse(likeResult, requestId))

      case 'reply':
        if (!content || !content.trim()) {
          return NextResponse.json(
            { error: 'Reply content is required' },
            { status: 400 }
          )
        }
        logInfo('Sending message reply', { messageId: params.id }, 'CommunityMessageAPI')
        const reply = await sendMessageReply(params.id, content.trim())
        return NextResponse.json(createSuccessResponse(reply, requestId))

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    return handleError(error, 'CommunityMessageAPI', requestId)
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId()
  
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'replies') {
      logInfo('Fetching message replies', { messageId: params.id }, 'CommunityMessageAPI')
      const replies = await getMessageReplies(params.id)
      return NextResponse.json(createSuccessResponse(replies, requestId))
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    return handleError(error, 'CommunityMessageAPI', requestId)
  }
}
