'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getCities } from '@/lib/api'

export default function CitySlugRedirect() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  useEffect(() => {
    const redirectToNewUrl = async () => {
      try {
        const cities = await getCities()
        const city = cities.find(c => 
          c.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase() ||
          c.name.toLowerCase().replace(/\s+/g, '_') === slug.toLowerCase() ||
          c.id === slug
        )
        
        if (city) {
          const citySlug = city.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
          const countrySlug = city.country.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
          router.replace(`/nomadcities/${countrySlug}/${citySlug}`)
        } else {
          router.replace('/nomadcities')
        }
      } catch (error) {
        console.error('Error redirecting city:', error)
        router.replace('/nomadcities')
      }
    }

    redirectToNewUrl()
  }, [router, slug])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to city page...</p>
      </div>
    </div>
  )
}