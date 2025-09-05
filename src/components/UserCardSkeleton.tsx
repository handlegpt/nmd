'use client'

export default function UserCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
      <div className="flex items-start space-x-4">
        {/* Avatar skeleton */}
        <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
        
        <div className="flex-1 space-y-3">
          {/* Name skeleton */}
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4 animate-pulse" />
          
          {/* Profession skeleton */}
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 animate-pulse" />
          
          {/* Location skeleton */}
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3 animate-pulse" />
          
          {/* Interests skeleton */}
          <div className="flex space-x-2">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-16 animate-pulse" />
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-20 animate-pulse" />
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-14 animate-pulse" />
          </div>
          
          {/* Stats skeleton */}
          <div className="flex space-x-4">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12 animate-pulse" />
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 animate-pulse" />
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 animate-pulse" />
          </div>
        </div>
        
        {/* Status skeleton */}
        <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
      </div>
      
      {/* Bio skeleton */}
      <div className="mt-4 space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full animate-pulse" />
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6 animate-pulse" />
      </div>
      
      {/* Actions skeleton */}
      <div className="mt-4 flex space-x-3">
        <div className="flex-1 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse" />
        <div className="flex-1 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse" />
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse" />
      </div>
    </div>
  )
}
