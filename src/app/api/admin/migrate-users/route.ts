import { NextRequest, NextResponse } from 'next/server'
import { batchUserMigration } from '@/lib/batchUserMigration'
import { logInfo, logError } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    logInfo('Starting batch user migration via API', {}, 'AdminMigrationAPI')

    const body = await request.json()
    const { batchSize = 50 } = body

    // 验证批次大小
    if (batchSize < 1 || batchSize > 200) {
      return NextResponse.json(
        { error: 'Batch size must be between 1 and 200' },
        { status: 400 }
      )
    }

    // 执行批量迁移
    const result = await batchUserMigration.migrateUsersInBatches(batchSize)

    logInfo('Batch migration completed via API', {
      totalUsers: result.totalUsers,
      migratedUsers: result.migratedUsers,
      failedUsers: result.failedUsers,
      success: result.success
    }, 'AdminMigrationAPI')

    return NextResponse.json({
      success: result.success,
      data: result
    })

  } catch (error) {
    logError('Batch migration API failed', error, 'AdminMigrationAPI')
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    logInfo('Getting migration stats via API', {}, 'AdminMigrationAPI')

    const stats = await batchUserMigration.getMigrationStats()

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    logError('Failed to get migration stats via API', error, 'AdminMigrationAPI')
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get migration stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
