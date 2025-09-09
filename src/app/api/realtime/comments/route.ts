import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logInfo, logError } from '@/lib/logger'

// GET /api/realtime/comments - 获取实时评论更新
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const place_id = searchParams.get('place_id')
    const since = searchParams.get('since') // ISO timestamp
    
    if (!place_id) {
      return NextResponse.json({ error: 'Place ID is required' }, { status: 400 })
    }
    
    logInfo('Fetching real-time comments', { place_id, since }, 'RealtimeCommentsAPI')
    
    let query = supabase
      .from('place_reviews')
      .select(`
        id,
        user_id,
        user_name,
        user_avatar,
        rating_wifi,
        rating_environment,
        rating_social,
        rating_value,
        overall_rating,
        comment,
        photos,
        check_in_date,
        created_at,
        updated_at
      `)
      .eq('place_id', place_id)
      .order('created_at', { ascending: false })
    
    // 如果提供了since参数，只获取该时间之后的评论
    if (since) {
      query = query.gte('created_at', since)
    }
    
    const { data: comments, error } = await query
    
    if (error) {
      logError('Error fetching real-time comments', error, 'RealtimeCommentsAPI')
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
    }
    
    logInfo('Successfully fetched real-time comments', { count: comments?.length || 0 }, 'RealtimeCommentsAPI')
    return NextResponse.json({ 
      comments: comments || [],
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    logError('Unexpected error in real-time comments API', error, 'RealtimeCommentsAPI')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/realtime/comments - 发布新评论（实时）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      place_id,
      user_id,
      user_name,
      user_avatar,
      rating_wifi,
      rating_environment,
      rating_social,
      rating_value,
      overall_rating,
      comment,
      photos
    } = body
    
    if (!place_id || !user_id || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    logInfo('Publishing real-time comment', { place_id, user_id }, 'RealtimeCommentsAPI')
    
    const { data: newComment, error } = await supabase
      .from('place_reviews')
      .insert({
        place_id,
        user_id,
        user_name: user_name || 'Anonymous',
        user_avatar,
        rating_wifi: rating_wifi || 5,
        rating_environment: rating_environment || 5,
        rating_social: rating_social || 5,
        rating_value: rating_value || 5,
        overall_rating: overall_rating || 5,
        comment,
        photos: photos || [],
        check_in_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single()
    
    if (error) {
      logError('Error publishing real-time comment', error, 'RealtimeCommentsAPI')
      return NextResponse.json({ error: 'Failed to publish comment' }, { status: 500 })
    }
    
    // 更新地点的平均评分
    await updatePlaceAverageRating(place_id)
    
    logInfo('Successfully published real-time comment', { commentId: newComment.id }, 'RealtimeCommentsAPI')
    return NextResponse.json({ 
      comment: newComment,
      timestamp: new Date().toISOString()
    }, { status: 201 })
    
  } catch (error) {
    logError('Unexpected error in real-time comments API', error, 'RealtimeCommentsAPI')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 更新地点的平均评分
async function updatePlaceAverageRating(placeId: string) {
  try {
    const { data: reviews } = await supabase
      .from('place_reviews')
      .select('overall_rating')
      .eq('place_id', placeId)
    
    if (reviews && reviews.length > 0) {
      const avgRating = reviews.reduce((sum: number, r: any) => sum + r.overall_rating, 0) / reviews.length
      const reviewCount = reviews.length
      
      await supabase
        .from('places')
        .update({
          rating: Math.round(avgRating * 10) / 10,
          review_count: reviewCount
        })
        .eq('id', placeId)
      
      logInfo('Updated place average rating', { placeId, avgRating, reviewCount }, 'RealtimeCommentsAPI')
    }
  } catch (error) {
    logError('Error updating place average rating', error, 'RealtimeCommentsAPI')
  }
}
