import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logInfo, logError } from '@/lib/logger'

// GET /api/places/[placeId]/reviews - 获取地点评论
export async function GET(
  request: NextRequest,
  { params }: { params: { placeId: string } }
) {
  try {
    const { placeId } = params
    
    logInfo('Fetching place reviews', { placeId }, 'PlaceReviewsAPI')
    
    const { data: reviews, error } = await supabase
      .from('place_reviews')
      .select(`
        *,
        user:users(name, avatar_url)
      `)
      .eq('place_id', placeId)
      .order('created_at', { ascending: false })
    
    if (error) {
      logError('Error fetching place reviews', error, 'PlaceReviewsAPI')
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }
    
    logInfo('Successfully fetched place reviews', { count: reviews?.length || 0 }, 'PlaceReviewsAPI')
    return NextResponse.json({ reviews: reviews || [] })
    
  } catch (error) {
    logError('Unexpected error in place reviews API', error, 'PlaceReviewsAPI')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/places/[placeId]/reviews - 创建地点评论
export async function POST(
  request: NextRequest,
  { params }: { params: { placeId: string } }
) {
  try {
    const { placeId } = params
    const body = await request.json()
    
    const {
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
      check_in_date
    } = body
    
    logInfo('Creating place review', { placeId, user_id }, 'PlaceReviewsAPI')
    
    // 验证必需字段
    if (!user_id || !rating_wifi || !rating_environment || !rating_social || !rating_value || !overall_rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // 验证评分范围
    const ratings = [rating_wifi, rating_environment, rating_social, rating_value, overall_rating]
    if (ratings.some(rating => rating < 1 || rating > 5)) {
      return NextResponse.json({ error: 'Ratings must be between 1 and 5' }, { status: 400 })
    }
    
    const { data: review, error } = await supabase
      .from('place_reviews')
      .insert({
        place_id: placeId,
        user_id,
        user_name: user_name || 'Anonymous',
        user_avatar,
        rating_wifi,
        rating_environment,
        rating_social,
        rating_value,
        overall_rating,
        comment,
        photos: photos || [],
        check_in_date: check_in_date || new Date().toISOString().split('T')[0]
      })
      .select()
      .single()
    
    if (error) {
      logError('Error creating place review', error, 'PlaceReviewsAPI')
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
    }
    
    // 更新地点的平均评分
    await updatePlaceAverageRating(placeId)
    
    logInfo('Successfully created place review', { reviewId: review.id }, 'PlaceReviewsAPI')
    return NextResponse.json({ review }, { status: 201 })
    
  } catch (error) {
    logError('Unexpected error in place reviews API', error, 'PlaceReviewsAPI')
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
      
      // 更新places表的评分和评论数
      await supabase
        .from('places')
        .update({
          rating: Math.round(avgRating * 100) / 100, // 保留两位小数
          review_count: reviewCount
        })
        .eq('id', placeId)
      
      logInfo('Updated place average rating', { placeId, avgRating, reviewCount }, 'PlaceReviewsAPI')
    }
  } catch (error) {
    logError('Error updating place average rating', error, 'PlaceReviewsAPI')
  }
}
