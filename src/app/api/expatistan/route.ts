import { NextRequest, NextResponse } from 'next/server'
import { expatistanScraper } from '@/lib/expatistanScraperService'
import { expatistanCache } from '@/lib/expatistanCacheService'

/**
 * Expatistan数据管理API
 * GET: 获取城市数据
 * POST: 手动抓取数据
 * DELETE: 清理缓存
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const country = searchParams.get('country')
    const action = searchParams.get('action')

    if (!city || !country) {
      return NextResponse.json(
        { error: 'City and country parameters are required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'stats':
        // 获取缓存统计
        const cacheStats = await expatistanCache.getStats()
        const scrapingStats = expatistanScraper.getScrapingStats()
        
        return NextResponse.json({
          success: true,
          data: {
            cache: cacheStats,
            scraping: scrapingStats
          }
        })

      case 'check':
        // 检查缓存状态
        const cacheKey = `expatistan-${city.toLowerCase()}-${country.toLowerCase()}`
        const cachedData = await expatistanCache.get(cacheKey)
        
        return NextResponse.json({
          success: true,
          data: {
            cached: !!cachedData,
            data: cachedData,
            cacheKey
          }
        })

      default:
        // 获取数据（优先从缓存）
        const data = await expatistanScraper.getExpatistanData(city, country)
        
        if (data) {
          return NextResponse.json({
            success: true,
            data,
            source: 'expatistan'
          })
        } else {
          return NextResponse.json(
            { error: 'No data available for this city' },
            { status: 404 }
          )
        }
    }
  } catch (error) {
    console.error('Expatistan API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { city, country, force = false } = body

    if (!city || !country) {
      return NextResponse.json(
        { error: 'City and country are required' },
        { status: 400 }
      )
    }

    // 检查是否强制抓取
    if (!force) {
      const cacheKey = `expatistan-${city.toLowerCase()}-${country.toLowerCase()}`
      const cachedData = await expatistanCache.get(cacheKey)
      
      if (cachedData) {
        return NextResponse.json({
          success: true,
          data: cachedData,
          source: 'cache',
          message: 'Data found in cache. Use force=true to refresh.'
        })
      }
    }

    // 执行抓取
    console.log(`Manual scraping requested for: ${city}, ${country}`)
    const data = await expatistanScraper.getExpatistanData(city, country)

    if (data) {
      return NextResponse.json({
        success: true,
        data,
        source: 'scraped',
        message: 'Data successfully scraped and cached'
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to scrape data' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Expatistan POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const city = searchParams.get('city')
    const country = searchParams.get('country')

    switch (action) {
      case 'clear-all':
        // 清理所有缓存
        await expatistanScraper.clearCache()
        return NextResponse.json({
          success: true,
          message: 'All Expatistan cache cleared'
        })

      case 'clear-city':
        // 清理特定城市缓存
        if (!city || !country) {
          return NextResponse.json(
            { error: 'City and country are required for clearing specific cache' },
            { status: 400 }
          )
        }
        
        const cacheKey = `expatistan-${city.toLowerCase()}-${country.toLowerCase()}`
        await expatistanCache.delete(cacheKey)
        
        return NextResponse.json({
          success: true,
          message: `Cache cleared for ${city}, ${country}`
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use clear-all or clear-city' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Expatistan DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
