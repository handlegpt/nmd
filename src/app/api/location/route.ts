import { NextResponse } from 'next/server'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // 从请求头获取IP地址
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1'
    
    // 使用免费的IP地理位置API
    const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting,query`)
    
    if (!geoResponse.ok) {
      throw new Error('Failed to fetch location data')
    }
    
    const geoData = await geoResponse.json()
    
    if (geoData.status === 'success') {
      return NextResponse.json({
        success: true,
        city: geoData.city,
        country: geoData.country,
        region: geoData.regionName,
        timezone: geoData.timezone,
        latitude: geoData.lat,
        longitude: geoData.lon,
        isp: geoData.isp
      })
    } else {
      // 如果IP地理位置失败，返回默认数据
      return NextResponse.json({
        success: true,
        city: 'Unknown',
        country: 'Unknown',
        region: 'Unknown',
        timezone: 'UTC',
        latitude: 0,
        longitude: 0,
        isp: 'Unknown'
      })
    }
  } catch (error) {
    console.error('Location API error:', error)
    
    // 返回默认数据
    return NextResponse.json({
      success: true,
      city: 'Unknown',
      country: 'Unknown',
      region: 'Unknown',
      timezone: 'UTC',
      latitude: 0,
      longitude: 0,
      isp: 'Unknown'
    })
  }
}
