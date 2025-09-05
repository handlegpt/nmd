import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logInfo, logError } from '@/lib/logger'

export async function GET(request: NextRequest) {
  console.log('🔍 Database status check API called')
  
  try {
    const status = {
      connection: false,
      tables: {
        verification_codes: false,
        users: false,
        user_preferences: false,
        user_favorites: false,
        user_visas: false,
        votes: false
      },
      errors: [] as string[]
    }

    // 1. 检查数据库连接
    console.log('🔍 Step 1: Checking database connection')
    try {
      const { data: connectionTest, error: connectionError } = await supabase
        .from('verification_codes')
        .select('count')
        .limit(1)

      if (connectionError) {
        console.error('❌ Database connection failed:', connectionError)
        status.errors.push(`Connection failed: ${connectionError.message}`)
      } else {
        console.log('✅ Database connection successful')
        status.connection = true
      }
    } catch (error) {
      console.error('❌ Database connection error:', error)
      status.errors.push(`Connection error: ${error}`)
    }

    // 2. 检查verification_codes表
    console.log('🔍 Step 2: Checking verification_codes table')
    try {
      const { data: codesTable, error: codesError } = await supabase
        .from('verification_codes')
        .select('*')
        .limit(1)

      if (codesError) {
        console.error('❌ verification_codes table check failed:', codesError)
        status.errors.push(`verification_codes table: ${codesError.message}`)
      } else {
        console.log('✅ verification_codes table accessible')
        status.tables.verification_codes = true
      }
    } catch (error) {
      console.error('❌ verification_codes table error:', error)
      status.errors.push(`verification_codes table error: ${error}`)
    }

    // 3. 检查users表
    console.log('🔍 Step 3: Checking users table')
    try {
      const { data: usersTable, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1)

      if (usersError) {
        console.error('❌ users table check failed:', usersError)
        status.errors.push(`users table: ${usersError.message}`)
      } else {
        console.log('✅ users table accessible')
        status.tables.users = true
      }
    } catch (error) {
      console.error('❌ users table error:', error)
      status.errors.push(`users table error: ${error}`)
    }

    // 4. 检查user_preferences表
    console.log('🔍 Step 4: Checking user_preferences table')
    try {
      const { data: preferencesTable, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .limit(1)

      if (preferencesError) {
        console.error('❌ user_preferences table check failed:', preferencesError)
        status.errors.push(`user_preferences table: ${preferencesError.message}`)
      } else {
        console.log('✅ user_preferences table accessible')
        status.tables.user_preferences = true
      }
    } catch (error) {
      console.error('❌ user_preferences table error:', error)
      status.errors.push(`user_preferences table error: ${error}`)
    }

    // 5. 检查user_favorites表
    console.log('🔍 Step 5: Checking user_favorites table')
    try {
      const { data: favoritesTable, error: favoritesError } = await supabase
        .from('user_favorites')
        .select('*')
        .limit(1)

      if (favoritesError) {
        console.error('❌ user_favorites table check failed:', favoritesError)
        status.errors.push(`user_favorites table: ${favoritesError.message}`)
      } else {
        console.log('✅ user_favorites table accessible')
        status.tables.user_favorites = true
      }
    } catch (error) {
      console.error('❌ user_favorites table error:', error)
      status.errors.push(`user_favorites table error: ${error}`)
    }

    // 6. 检查user_visas表
    console.log('🔍 Step 6: Checking user_visas table')
    try {
      const { data: visasTable, error: visasError } = await supabase
        .from('user_visas')
        .select('*')
        .limit(1)

      if (visasError) {
        console.error('❌ user_visas table check failed:', visasError)
        status.errors.push(`user_visas table: ${visasError.message}`)
      } else {
        console.log('✅ user_visas table accessible')
        status.tables.user_visas = true
      }
    } catch (error) {
      console.error('❌ user_visas table error:', error)
      status.errors.push(`user_visas table error: ${error}`)
    }

    // 7. 检查votes表
    console.log('🔍 Step 7: Checking votes table')
    try {
      const { data: votesTable, error: votesError } = await supabase
        .from('votes')
        .select('*')
        .limit(1)

      if (votesError) {
        console.error('❌ votes table check failed:', votesError)
        status.errors.push(`votes table: ${votesError.message}`)
      } else {
        console.log('✅ votes table accessible')
        status.tables.votes = true
      }
    } catch (error) {
      console.error('❌ votes table error:', error)
      status.errors.push(`votes table error: ${error}`)
    }

    // 8. 检查表结构
    console.log('🔍 Step 8: Checking table structure')
    try {
      // 检查verification_codes表结构
      const { data: codesStructure, error: codesStructureError } = await supabase
        .from('verification_codes')
        .select('id, email, code, expires_at, created_at')
        .limit(0)

      if (codesStructureError) {
        console.error('❌ verification_codes structure check failed:', codesStructureError)
        status.errors.push(`verification_codes structure: ${codesStructureError.message}`)
      } else {
        console.log('✅ verification_codes table structure valid')
      }
    } catch (error) {
      console.error('❌ verification_codes structure error:', error)
      status.errors.push(`verification_codes structure error: ${error}`)
    }

    try {
      // 检查users表结构
      const { data: usersStructure, error: usersStructureError } = await supabase
        .from('users')
        .select('id, email, name, avatar_url, current_city, created_at')
        .limit(0)

      if (usersStructureError) {
        console.error('❌ users structure check failed:', usersStructureError)
        status.errors.push(`users structure: ${usersStructureError.message}`)
      } else {
        console.log('✅ users table structure valid')
      }
    } catch (error) {
      console.error('❌ users structure error:', error)
      status.errors.push(`users structure error: ${error}`)
    }

    // 9. 返回状态
    console.log('🎉 Database status check completed')
    return NextResponse.json({
      success: true,
      message: 'Database status check completed',
      data: status
    })

  } catch (error) {
    console.error('💥 Unexpected error in database status check:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Internal server error'
      },
      { status: 500 }
    )
  }
}
