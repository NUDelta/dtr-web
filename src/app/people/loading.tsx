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
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <header className="pb-4 pt-6 sm:pt-10">
        <h1 className="text-4xl font-semibold tracking-tight">People</h1>
        <p className="mt-1 max-w-2xl text-lg text-gray-600">
          Browse our faculty, students, and alumni.
        </p>

        {/* Search skeleton */}
        <div className="mb-6">
          <div className="relative mx-auto max-w-xl">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 rounded bg-yellow-300" />
            <div className="h-10 w-full rounded-full border border-neutral-200 bg-white" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border border-neutral-200 bg-white" />
          </div>
        </div>

        {/* View controls row (status + view mode) */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {/* Status segmented control skeleton */}
          <SegmentedSkeleton labels={['Active', 'Alumni']} />

          {/* View toggle skeleton (Card/List), pushed right on larger screens */}
          <div className="ml-auto">
            <SegmentedSkeleton labels={['Card', 'List']} />
          </div>
        </div>
      </header>

      {/* Results skeleton */}
      <section aria-label="Directory" className="space-y-6 pb-10">
        <RoleBlockSkeleton />
        <RoleBlockSkeleton />
        <RoleBlockSkeleton />
      </section>
    </main>
  )
}

function SegmentedSkeleton({ labels }: { labels: string[] }) {
  return (
    <div
      className="inline-flex select-none items-center gap-1 rounded-full border border-gray-200 bg-gray-50 p-1"
      role="tablist"
      aria-label="Loading segmented control"
    >
      {labels.map((label, i) => (
        <div
          key={`${label}-${i}`}
          className="rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-black/5"
          aria-hidden
        >
          <span className="block h-4 w-12 animate-pulse rounded bg-gray-200" />
        </div>
      ))}
    </div>
  )
}

function RoleBlockSkeleton() {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
      {/* Summary row */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
      </div>

      {/* Cards grid skeleton */}
      <ul
        role="list"
        aria-label="Loading people"
        className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <li key={i} className="list-none">
            <CardSkeleton />
          </li>
        ))}
      </ul>

      {/* Show more button skeleton */}
      <div className="flex items-center justify-center p-4 pt-0">
        <div
          className="h-9 w-32 animate-pulse rounded-xl border border-gray-200 bg-gray-50"
          aria-hidden
        />
      </div>
    </section>
  )
}

function CardSkeleton() {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white/80 shadow-sm">
      {/* Image placeholder */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        <div
          className="absolute inset-0 animate-pulse bg-gray-200"
          aria-hidden
        />
      </div>

      {/* Text lines */}
      <div className="space-y-2 p-4">
        <div
          className="h-5 w-3/4 animate-pulse rounded bg-gray-200"
          aria-hidden
        />
        <div
          className="h-4 w-1/2 animate-pulse rounded bg-gray-200"
          aria-hidden
        />
        <div className="mt-3 space-y-2">
          <div
            className="h-3 w-full animate-pulse rounded bg-gray-200"
            aria-hidden
          />
          <div
            className="h-3 w-5/6 animate-pulse rounded bg-gray-200"
            aria-hidden
          />
          <div
            className="h-3 w-2/3 animate-pulse rounded bg-gray-200"
            aria-hidden
          />
        </div>
        <div
          className="mt-3 h-8 w-24 animate-pulse rounded-lg bg-gray-100"
          aria-hidden
        />
      </div>
    </article>
  )
}
