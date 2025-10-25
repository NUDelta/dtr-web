'use client'

import { startProgress, stopProgress } from 'next-nprogress-bar'
import { useCallback, useEffect } from 'react'

export default function Loading() {
  const stableStartProgress = useCallback(startProgress, [])
  const stableStopProgress = useCallback(stopProgress, [])

  useEffect(() => {
    stableStartProgress()
    return () => stableStopProgress()
  }, [stableStartProgress, stableStopProgress])

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-gray-50 p-8 animate-pulse">
          {/* SIG name placeholder */}
          <div className="mb-4 h-8 w-1/2 rounded-md bg-gray-300" />

          {/* SIG banner image placeholder */}
          <div className="h-48 w-full rounded-md bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer" />

          {/* SIG description placeholder */}
          <div className="my-4 space-y-3">
            <div className="h-4 w-3/4 rounded-md bg-gray-300" />
            <div className="h-4 w-2/3 rounded-md bg-gray-300" />
            <div className="h-4 w-5/6 rounded-md bg-gray-300" />
          </div>

          {/* Projects in SIG placeholder */}
          <div className="my-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="mb-4">
                <div className="h-8 w-3/4 rounded-md bg-gray-300" />
                <div className="mt-2 h-4 w-full rounded-md bg-gray-300" />
                <div className="mt-2 h-4 w-3/4 rounded-md bg-gray-300" />
              </div>
            ))}
          </div>

          {/* Members of SIG placeholder */}
          <div className="w-full">
            <div className="mb-2 h-6 w-1/4 rounded-md bg-gray-300" />
            <div className="mt-4 flex space-x-4">
              {Array.from({ length: 3 }).map((_, k) => (
                <div key={k} className="h-12 w-12 rounded-full bg-gray-300" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
