import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logInfo, logError } from '@/lib/logger'

// 文件头验证函数
function validateImageFileHeader(fileHeader: Uint8Array, mimeType: string): boolean {
  // JPEG文件头: FF D8 FF
  const jpegHeader = [0xFF, 0xD8, 0xFF]
  
  // PNG文件头: 89 50 4E 47 0D 0A 1A 0A
  const pngHeader = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
  
  // WebP文件头: 52 49 46 46 (RIFF) + 57 45 42 50 (WEBP)
  const webpHeader = [0x52, 0x49, 0x46, 0x46]
  const webpFormat = [0x57, 0x45, 0x42, 0x50]
  
  // GIF文件头: 47 49 46 38 (GIF8)
  const gifHeader = [0x47, 0x49, 0x46, 0x38]
  
  switch (mimeType) {
    case 'image/jpeg':
      return jpegHeader.every((byte, index) => fileHeader[index] === byte)
    
    case 'image/png':
      return pngHeader.every((byte, index) => fileHeader[index] === byte)
    
    case 'image/webp':
      return webpHeader.every((byte, index) => fileHeader[index] === byte) &&
             webpFormat.every((byte, index) => fileHeader[index + 8] === byte)
    
    case 'image/gif':
      return gifHeader.every((byte, index) => fileHeader[index] === byte)
    
    default:
      return false
  }
}

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
    
    // 验证文件类型和文件头
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    
    // 检查MIME类型
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed' }, { status: 400 })
    }
    
    // 检查文件扩展名
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json({ error: 'Invalid file extension' }, { status: 400 })
    }
    
    // 验证文件头（魔数）
    const fileBuffer = await file.arrayBuffer()
    const fileHeader = new Uint8Array(fileBuffer.slice(0, 8))
    
    const isValidImageHeader = validateImageFileHeader(fileHeader, file.type)
    if (!isValidImageHeader) {
      return NextResponse.json({ error: 'File header validation failed. File may be corrupted or not a valid image' }, { status: 400 })
    }
    
    // 验证文件大小 (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }
    
    // 验证文件大小 (最小1KB)
    if (file.size < 1024) {
      return NextResponse.json({ error: 'File size too small' }, { status: 400 })
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
