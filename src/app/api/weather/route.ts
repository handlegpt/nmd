import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')
  const city = searchParams.get('city')

  // 如果没有提供坐标，返回错误
  if (!lat || !lon) {
    return NextResponse.json({ 
      error: 'Missing latitude and longitude parameters' 
    }, { status: 400 })
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
    
    if (!apiKey) {
      // 如果没有API密钥，返回模拟数据
      return NextResponse.json({
        temperature: 22,
        description: 'sunny',
        icon: '01d',
        humidity: 65,
        windSpeed: 3.2,
        city: city || 'Unknown',
        fallback: true
      })
    }

    // 调用OpenWeatherMap API
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=zh_cn`,
      {
        headers: {
          'User-Agent': 'NomadNow/1.0'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Weather API request failed with status: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind?.speed || 0,
      city: data.name,
      country: data.sys.country,
      real: true
    })
  } catch (error) {
    console.error('Weather API error:', error)
    
    // 返回模拟数据作为回退
    return NextResponse.json({
      temperature: 22,
      description: 'sunny',
      icon: '01d',
      humidity: 65,
      windSpeed: 3.2,
      city: city || 'Unknown',
      fallback: true,
      error: 'Weather service unavailable'
    })
  }
}
