'use client'

import { startProgress, stopProgress } from 'next-nprogress-bar'
import { useCallback, useEffect } from 'react'

const Line = ({ w = 'w-full' }: { w?: string }) => (
  <div className={`h-3 ${w} rounded bg-neutral-200`} />
)

/**
 * Card skeleton with yellow accents.
 * Matches Projects page structure: banner (optional), header, description,
 * and a collapsed section placeholder.
 */
const SigCardSkeleton = ({ withBanner = true }: { withBanner?: boolean }) => (
  <article
    aria-hidden="true"
    className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 shadow-sm"
  >
    {/* Yellow accent top bar */}
    <div className="h-1.5 w-full bg-yellow-400" />

    {/* Banner */}
    {withBanner
      ? (
          <div className="relative aspect-16/7 w-full bg-neutral-200" />
        )
      : (
          <div className="h-2" />
        )}

    {/* Header */}
    <div className="flex items-start justify-between gap-3 p-5">
      <div className="flex-1 space-y-2">
        <div className="h-6 w-2/3 rounded bg-neutral-200" />
        <div className="h-1 w-10 rounded-full bg-yellow-300" />
      </div>
      <div className="h-8 w-24 rounded-md border border-neutral-200 bg-white" />
    </div>

    {/* Description */}
    <div className="px-5 pb-5">
      <div className="space-y-2">
        <Line w="w-11/12" />
        <Line w="w-10/12" />
        <Line w="w-9/12" />
      </div>
    </div>

    {/* Collapsible area placeholder */}
    <div className="border-t border-neutral-200 p-5">
      <div className="mb-3 h-5 w-24 rounded bg-neutral-200" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="mb-2 h-4 w-3/4 rounded bg-neutral-200" />
          <div className="space-y-2">
            <Line w="w-10/12" />
            <Line w="w-8/12" />
          </div>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="mb-2 h-4 w-2/3 rounded bg-neutral-200" />
          <div className="space-y-2">
            <Line w="w-9/12" />
            <Line w="w-7/12" />
          </div>
        </div>
      </div>
    </div>
  </article>
)

export default function Loading() {
  const stableStartProgress = useCallback(() => startProgress(), [])
  const stableStopProgress = useCallback(() => stopProgress(), [])

  useEffect(() => {
    stableStartProgress()
    return () => stableStopProgress()
  }, [stableStartProgress, stableStopProgress])

  // Keep column balance similar to the page (two stacks)
  // Vary banners to mimic different card heights.
  const left = [true, false, true]
  const right = [true, true, false]

  return (
    <div
      className="mx-auto max-w-6xl px-4 py-10 animate-pulse"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading projects"
    >
      {/* Header */}
      <header className="mb-8">
        <div className="h-8 w-64 rounded bg-neutral-200" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-neutral-200" />
      </header>

      {/* Search skeleton */}
      <div className="mb-6">
        <div className="relative mx-auto max-w-xl">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 rounded bg-yellow-300" />
          <div className="h-10 w-full rounded-full border border-neutral-200 bg-white" />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border border-neutral-200 bg-white" />
        </div>
      </div>

      {/* Two independent columns */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          {left.map((withBanner, i) => (
            <SigCardSkeleton key={`l-${i}`} withBanner={withBanner} />
          ))}
        </div>
        <div className="flex flex-col gap-6">
          {right.map((withBanner, i) => (
            <SigCardSkeleton key={`r-${i}`} withBanner={withBanner} />
          ))}
        </div>
      </div>
    </div>
  )
}
