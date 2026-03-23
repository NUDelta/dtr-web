'use client'

import { startProgress, stopProgress } from 'next-nprogress-bar'
import { useCallback, useEffect } from 'react'

const Line = ({ w = 'w-full' }: { w?: string }) => (
  <div className={`h-3 ${w} rounded bg-neutral-200`} />
)

const ProjectPreviewSkeleton = () => (
  <div className="rounded-2xl border border-neutral-200 bg-white p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-3">
        <div className="h-6 w-20 rounded-full bg-neutral-200" />
        <div className="h-5 w-40 rounded bg-neutral-200" />
      </div>
      <div className="h-8 w-28 rounded-full border border-neutral-200 bg-neutral-100" />
    </div>
    <div className="mt-4 space-y-2">
      <Line w="w-11/12" />
      <Line w="w-10/12" />
      <Line w="w-8/12" />
    </div>
  </div>
)

const SigSectionSkeleton = ({ withBanner = true }: { withBanner?: boolean }) => (
  <article
    aria-hidden="true"
    className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm"
  >
    {withBanner
      ? (
          <div className="relative aspect-[16/6] w-full bg-neutral-200" />
        )
      : null}

    <div className="space-y-5 p-6">
      <div className="flex flex-wrap gap-2">
        <div className="h-6 w-24 rounded-full bg-yellow-100" />
        <div className="h-6 w-24 rounded-full bg-neutral-100" />
        <div className="h-6 w-28 rounded-full bg-neutral-100" />
      </div>
      <div className="space-y-2">
        <div className="h-7 w-80 max-w-full rounded bg-neutral-200" />
        <Line w="w-11/12" />
        <Line w="w-10/12" />
        <Line w="w-9/12" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="h-6 w-36 rounded bg-neutral-200" />
          <div className="h-4 w-14 rounded bg-neutral-200" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ProjectPreviewSkeleton />
          <ProjectPreviewSkeleton />
        </div>
      </div>

      <div className="border-t border-neutral-200 pt-5">
        <div className="mb-3 h-7 w-20 rounded bg-neutral-200" />
        <div className="mb-4 h-1 w-10 rounded-full bg-yellow-100" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <div className="h-4 w-36 rounded bg-neutral-200" />
            <Line w="w-10/12" />
            <Line w="w-8/12" />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-44 rounded bg-neutral-200" />
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

  return (
    <div
      className="mx-auto max-w-7xl animate-pulse px-4 py-10"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading projects"
    >
      <header className="pb-4">
        <div className="h-9 w-64 rounded bg-neutral-200" />
        <div className="mt-3 h-5 w-[38rem] max-w-full rounded bg-neutral-200" />

        <div className="mt-6 rounded-[28px] border border-yellow-100 bg-white p-5 shadow-sm">
          <div className="h-4 w-28 rounded bg-yellow-100" />
          <div className="mt-3 space-y-2">
            <Line w="w-full" />
            <Line w="w-10/12" />
          </div>
        </div>

        <div className="mt-6">
          <div className="relative mx-auto max-w-xl">
            <div className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 rounded bg-yellow-300" />
            <div className="h-10 w-full rounded-full border border-neutral-200 bg-white" />
            <div className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-neutral-200 bg-white" />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="mt-2 inline-flex w-full max-w-md rounded-2xl border border-neutral-200 bg-neutral-50 p-1 shadow-sm">
            <div className="h-10 flex-1 rounded-xl bg-neutral-900" />
            <div className="h-10 flex-1 rounded-xl bg-transparent" />
          </div>
          <div className="h-4 w-56 rounded bg-neutral-200" />
        </div>
      </header>

      <div className="space-y-6">
        {[true, false, true].map((withBanner, i) => (
          <SigSectionSkeleton key={`sig-${i}`} withBanner={withBanner} />
        ))}
      </div>
    </div>
  )
}
