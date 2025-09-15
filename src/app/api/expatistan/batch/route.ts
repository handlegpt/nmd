import { NextRequest, NextResponse } from 'next/server'
import { expatistanScraper } from '@/lib/expatistanScraperService'

/**
 * Expatistan批量抓取API
 * POST: 批量抓取多个城市的数据
 */

// 预定义的热门城市列表
const POPULAR_CITIES = [
  { city: 'Bangkok', country: 'Thailand' },
  { city: 'Lisbon', country: 'Portugal' },
  { city: 'Berlin', country: 'Germany' },
  { city: 'Mexico City', country: 'Mexico' },
  { city: 'Barcelona', country: 'Spain' },
  { city: 'Prague', country: 'Czech Republic' },
  { city: 'Budapest', country: 'Hungary' },
  { city: 'Tallinn', country: 'Estonia' },
  { city: 'Chiang Mai', country: 'Thailand' },
  { city: 'Medellin', country: 'Colombia' },
  { city: 'Buenos Aires', country: 'Argentina' },
  { city: 'Sofia', country: 'Bulgaria' },
  { city: 'Warsaw', country: 'Poland' },
  { city: 'Krakow', country: 'Poland' },
  { city: 'Bratislava', country: 'Slovakia' },
  { city: 'Zagreb', country: 'Croatia' },
  { city: 'Belgrade', country: 'Serbia' },
  { city: 'Bucharest', country: 'Romania' },
  { city: 'Sarajevo', country: 'Bosnia and Herzegovina' },
  { city: 'Skopje', country: 'North Macedonia' }
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      cities = POPULAR_CITIES, 
      delay = 2000, 
      force = false,
      maxCities = 20 
    } = body

    // 限制批量抓取的城市数量
    const citiesToProcess = cities.slice(0, maxCities)
    
    console.log(`Starting batch scraping for ${citiesToProcess.length} cities`)
    console.log(`Delay between requests: ${delay}ms`)
    console.log(`Force refresh: ${force}`)

    const results = {
      total: citiesToProcess.length,
      success: 0,
      failed: 0,
      skipped: 0,
      details: [] as any[],
      startTime: new Date(),
      endTime: null as Date | null
    }

    for (let i = 0; i < citiesToProcess.length; i++) {
      const { city, country } = citiesToProcess[i]
      
      try {
        console.log(`[${i + 1}/${citiesToProcess.length}] Processing: ${city}, ${country}`)
        
        // 检查是否强制抓取
        if (!force) {
          const cacheKey = `expatistan-${city.toLowerCase()}-${country.toLowerCase()}`
          const cachedData = await expatistanScraper.getExpatistanData(city, country)
          
          if (cachedData) {
            results.skipped++
            results.details.push({
              city,
              country,
              status: 'skipped',
              reason: 'Data already cached',
              data: cachedData
            })
            console.log(`   ⏭️  Skipped (cached): ${city}, ${country}`)
            continue
          }
        }

        // 执行抓取
        const data = await expatistanScraper.getExpatistanData(city, country)
        
        if (data) {
          results.success++
          results.details.push({
            city,
            country,
            status: 'success',
            data
          })
          console.log(`   ✅ Success: ${city}, ${country}`)
        } else {
          results.failed++
          results.details.push({
            city,
            country,
            status: 'failed',
            reason: 'No data returned'
          })
          console.log(`   ❌ Failed: ${city}, ${country}`)
        }

        // 添加延迟避免过于频繁的请求
        if (i < citiesToProcess.length - 1) {
          console.log(`   ⏳ Waiting ${delay}ms before next request...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }

      } catch (error) {
        results.failed++
        results.details.push({
          city,
          country,
          status: 'error',
          error: error.message
        })
        console.error(`   💥 Error: ${city}, ${country} - ${error.message}`)
      }
    }

    results.endTime = new Date()
    const duration = results.endTime.getTime() - results.startTime.getTime()

    console.log(`\n🎉 Batch scraping completed!`)
    console.log(`   Total: ${results.total}`)
    console.log(`   Success: ${results.success}`)
    console.log(`   Failed: ${results.failed}`)
    console.log(`   Skipped: ${results.skipped}`)
    console.log(`   Duration: ${Math.round(duration / 1000)}s`)

    return NextResponse.json({
      success: true,
      data: {
        ...results,
        duration: duration,
        durationFormatted: `${Math.round(duration / 1000)}s`
      }
    })

  } catch (error) {
    console.error('Batch scraping error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'cities':
        // 获取预定义城市列表
        return NextResponse.json({
          success: true,
          data: {
            cities: POPULAR_CITIES,
            total: POPULAR_CITIES.length
          }
        })

      case 'stats':
        // 获取批量抓取统计
        const scrapingStats = expatistanScraper.getScrapingStats()
        return NextResponse.json({
          success: true,
          data: {
            scraping: scrapingStats,
            availableCities: POPULAR_CITIES.length,
            recommendedDelay: 2000,
            maxCitiesPerBatch: 20
          }
        })

      default:
        return NextResponse.json({
          success: true,
          data: {
            message: 'Expatistan Batch API',
            endpoints: {
              'POST /api/expatistan/batch': 'Start batch scraping',
              'GET /api/expatistan/batch?action=cities': 'Get available cities',
              'GET /api/expatistan/batch?action=stats': 'Get scraping statistics'
            },
            popularCities: POPULAR_CITIES.slice(0, 10) // 只显示前10个
          }
        })
    }
  } catch (error) {
    console.error('Batch API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
