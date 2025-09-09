import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logInfo, logError } from '@/lib/logger'

// GET /api/places/[placeId]/photos - 获取地点照片
export async function GET(
  request: NextRequest,
  { params }: { params: { placeId: string } }
) {
  try {
    const { placeId } = params
    
    logInfo('Fetching place photos', { placeId }, 'PlacePhotosAPI')
    
    const { data: photos, error } = await supabase
      .from('place_photos')
      .select('*')
      .eq('place_id', placeId)
      .order('created_at', { ascending: false })
    
    if (error) {
      logError('Error fetching place photos', error, 'PlacePhotosAPI')
      return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 })
    }
    
    logInfo('Successfully fetched place photos', { count: photos?.length || 0 }, 'PlacePhotosAPI')
    return NextResponse.json({ photos: photos || [] })
    
  } catch (error) {
    logError('Unexpected error in place photos API', error, 'PlacePhotosAPI')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/places/[placeId]/photos - 上传地点照片
export async function POST(
  request: NextRequest,
  { params }: { params: { placeId: string } }
) {
  try {
    const { placeId } = params
    const formData = await request.formData()
    
    const file = formData.get('file') as File
    const user_id = formData.get('user_id') as string
    const caption = formData.get('caption') as string
    
    if (!file || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    logInfo('Uploading place photo', { placeId, user_id, fileName: file.name }, 'PlacePhotosAPI')
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }
    
    // 验证文件大小 (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }
    
    // 生成唯一文件名
    const fileExt = file.name.split('.').pop()
    const fileName = `${placeId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    
    // 上传到Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('place-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) {
      logError('Error uploading file to storage', uploadError, 'PlacePhotosAPI')
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }
    
    // 获取公开URL
    const { data: { publicUrl } } = supabase.storage
      .from('place-photos')
      .getPublicUrl(fileName)
    
    // 保存照片记录到数据库
    const { data: photo, error: dbError } = await supabase
      .from('place_photos')
      .insert({
        place_id: placeId,
        user_id,
        file_name: fileName,
        file_url: publicUrl,
        caption: caption || '',
        file_size: file.size,
        mime_type: file.type
      })
      .select()
      .single()
    
    if (dbError) {
      logError('Error saving photo record', dbError, 'PlacePhotosAPI')
      // 尝试删除已上传的文件
      await supabase.storage.from('place-photos').remove([fileName])
      return NextResponse.json({ error: 'Failed to save photo record' }, { status: 500 })
    }
    
    logInfo('Successfully uploaded place photo', { photoId: photo.id, fileName }, 'PlacePhotosAPI')
    return NextResponse.json({ photo }, { status: 201 })
    
  } catch (error) {
    logError('Unexpected error in place photos API', error, 'PlacePhotosAPI')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
