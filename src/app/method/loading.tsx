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
        <h1 className="text-4xl font-semibold tracking-tight">Method</h1>
        <p className="mt-1 max-w-2xl text-lg text-gray-600">
          Discover the DTR method, a unique approach to mentoring and learning that
          emphasizes growth, reflection, and community engagement.
        </p>
        <p className="mt-1 text-sm text-gray-500">Loading method details…</p>
      </header>

      <section aria-label="DTR method content" className="space-y-8 pb-10">
        {/* “DTR at a glance” skeleton (with list) */}
        <MethodSectionSkeleton hasList />

        {/* “Getting started” skeleton */}
        <MethodSectionSkeleton />

        {/* “Grow with time” skeleton */}
        <MethodSectionSkeleton />
      </section>
    </main>
  )
}

function MethodSectionSkeleton({ hasList }: { hasList?: boolean }) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white/70 p-5 shadow-sm">
      {/* Section heading */}
      <div className="h-6 w-48 animate-pulse rounded bg-gray-200" aria-hidden />

      {/* Paragraph lines */}
      <div className="mt-3 space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" aria-hidden />
        <div className="h-4 w-11/12 animate-pulse rounded bg-gray-200" aria-hidden />
        <div className="h-4 w-10/12 animate-pulse rounded bg-gray-200" aria-hidden />
        <div className="h-4 w-9/12 animate-pulse rounded bg-gray-200" aria-hidden />
      </div>

      {hasList && (
        <ul className="mt-4 space-y-3" aria-hidden>
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex gap-3">
              <div className="mt-1 h-2.5 w-2.5 flex-none rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-10/12 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-9/12 animate-pulse rounded bg-gray-200" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
