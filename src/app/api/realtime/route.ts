import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// 存储连接的客户端
const clients = new Map<string, ReadableStreamDefaultController>()

// 存储待发送的更新
const pendingUpdates = new Map<string, any[]>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cityId = searchParams.get('cityId')
  const userId = searchParams.get('userId')
  
  const clientId = `${userId || 'anonymous'}-${Date.now()}-${Math.random()}`
  
  // 设置SSE响应头
  const headersList = headers()
  const responseHeaders = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  }

  const stream = new ReadableStream({
    start(controller) {
      // 存储客户端连接
      clients.set(clientId, controller)
      
      // 发送连接确认
      controller.enqueue(`data: ${JSON.stringify({
        type: 'connection',
        clientId,
        timestamp: new Date().toISOString()
      })}\n\n`)

      // 发送心跳
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({
            type: 'ping',
            timestamp: new Date().toISOString()
          })}\n\n`)
        } catch (error) {
          clearInterval(heartbeat)
          clients.delete(clientId)
        }
      }, 30000)

      // 发送待发送的更新
      if (cityId && pendingUpdates.has(cityId)) {
        const updates = pendingUpdates.get(cityId) || []
        updates.forEach(update => {
          controller.enqueue(`data: ${JSON.stringify(update)}\n\n`)
        })
        pendingUpdates.delete(cityId)
      }

      // 监听客户端断开
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        clients.delete(clientId)
        console.log(`Client ${clientId} disconnected`)
      })
    }
  })

  return new Response(stream, {
    headers: responseHeaders
  })
}

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()
    
    // 验证更新数据
    if (!update.type || !update.action || !update.data) {
      return NextResponse.json(
        { error: 'Invalid update data' },
        { status: 400 }
      )
    }

    // 添加时间戳
    const fullUpdate = {
      ...update,
      timestamp: new Date().toISOString()
    }

    // 广播给所有连接的客户端
    const cityId = update.data.cityId
    if (cityId) {
      // 存储更新，等待新客户端连接
      if (!pendingUpdates.has(cityId)) {
        pendingUpdates.set(cityId, [])
      }
      pendingUpdates.get(cityId)!.push(fullUpdate)
      
      // 限制存储的更新数量
      const updates = pendingUpdates.get(cityId)!
      if (updates.length > 50) {
        updates.splice(0, updates.length - 50)
      }
    }

    // 发送给所有连接的客户端
    const disconnectedClients: string[] = []
    
    clients.forEach((controller, clientId) => {
      try {
        controller.enqueue(`data: ${JSON.stringify(fullUpdate)}\n\n`)
      } catch (error) {
        console.error(`Failed to send update to client ${clientId}:`, error)
        disconnectedClients.push(clientId)
      }
    })

    // 清理断开的客户端
    disconnectedClients.forEach(clientId => {
      clients.delete(clientId)
    })

    console.log(`Broadcasted ${update.type} update to ${clients.size} clients`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing realtime update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 定期清理过期的待发送更新
setInterval(() => {
  const now = Date.now()
  pendingUpdates.forEach((updates, cityId) => {
    const filteredUpdates = updates.filter(update => {
      const updateTime = new Date(update.timestamp).getTime()
      return now - updateTime < 5 * 60 * 1000 // 5分钟内的更新
    })
    
    if (filteredUpdates.length === 0) {
      pendingUpdates.delete(cityId)
    } else {
      pendingUpdates.set(cityId, filteredUpdates)
    }
  })
}, 60000) // 每分钟清理一次
