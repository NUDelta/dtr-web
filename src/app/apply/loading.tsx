'use client'

import { startProgress, stopProgress } from 'next-nprogress-bar'
import { useCallback, useEffect } from 'react'

export default function Loading() {
  const stableStartProgress = useCallback(() => startProgress(), [])
  const stableStopProgress = useCallback(() => stopProgress(), [])

  useEffect(() => {
    stableStartProgress()
    return () => stableStopProgress()
  }, [stableStartProgress, stableStopProgress])

  return (
    <main
      className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <header className="pb-4 pt-6 sm:pt-10">
        <h1 className="text-4xl font-semibold tracking-tight">Apply</h1>
        <p className="mt-1 max-w-2xl text-lg text-gray-600">
          Join the DTR community by applying to become a mentee.
        </p>
        <p className="mt-1 text-sm text-gray-500">Loading application details…</p>
      </header>

      <section className="space-y-6 pb-10">
        {/* Quote skeleton */}
        <div className="rounded-lg border border-gray-200 border-l-4 border-l-gray-400 bg-gray-50 px-4 py-3">
          <div className="space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        {/* Steps skeleton */}
        <ol
          aria-label="Loading application steps"
          className="space-y-4"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex gap-3">
              {/* Step bullet */}
              <div className="mt-1 flex h-7 w-7 flex-none items-center justify-center">
                <div className="h-7 w-7 animate-pulse rounded-full bg-gray-200" />
              </div>

              {/* Step text */}
              <div className="flex-1 space-y-2">
                <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-11/12 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-10/12 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-7/12 animate-pulse rounded bg-gray-200" />
              </div>
            </li>
          ))}
        </ol>

        {/* Closing paragraph skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-11/12 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-10/12 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Contact line skeleton */}
        <div className="mt-4 space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Apply button skeleton */}
        <div className="mt-6">
          <div className="h-11 w-40 animate-pulse rounded-lg border-2 border-gray-200 bg-yellow-100/70" />
        </div>
      </section>
    </main>
  )
}
