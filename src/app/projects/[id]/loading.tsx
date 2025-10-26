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
    <div className="mx-auto max-w-4xl bg-gray-50 p-4 animate-pulse">
      {/* Title */}
      <div className="mb-4 h-8 w-3/4 rounded-md bg-gray-300" />

      {/* Main Banner */}
      <div className="h-48 w-full rounded-md bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer" />

      {/* Description */}
      <div className="my-8 space-y-3">
        <div className="h-4 w-5/6 rounded-md bg-gray-300" />
        <div className="h-4 w-3/4 rounded-md bg-gray-300" />
        <div className="h-4 w-4/5 rounded-md bg-gray-300" />
      </div>

      {/* Extra Images */}
      <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-32 w-full rounded-md bg-gray-300" />
            <div className="h-4 w-3/4 rounded-md bg-gray-300" />
          </div>
        ))}
      </div>

      {/* Publications */}
      <div className="mb-4">
        <div className="h-6 w-1/3 rounded-md bg-gray-300" />
        <div className="mt-2 h-4 w-5/6 rounded-md bg-gray-300" />
      </div>

      {/* Demo / Sprint Video */}
      <div className="my-4 space-y-4">
        <div className="h-32 w-full rounded-md bg-gray-300" />
        <div className="h-32 w-full rounded-md bg-gray-300" />
      </div>

      {/* Team Members */}
      <div className="w-full">
        <div className="mb-2 h-6 w-1/4 rounded-md bg-gray-300" />
        <div className="mt-4 flex space-x-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 w-12 rounded-full bg-gray-300" />
          ))}
        </div>
      </div>
    </div>
  )
}
