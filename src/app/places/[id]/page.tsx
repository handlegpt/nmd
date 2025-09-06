'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function PlaceDetailRedirect() {
  const router = useRouter()
  const params = useParams()
  const placeId = params.id as string

  useEffect(() => {
    router.replace(`/nomadplaces/${placeId}`)
  }, [router, placeId])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to nomad place details...</p>
      </div>
    </div>
  )
}