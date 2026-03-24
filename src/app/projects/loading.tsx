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
          <div className="relative aspect-16/6 w-full bg-neutral-200" />
        )
      : null}

    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap gap-2">
        <div className="h-6 w-24 rounded-full bg-yellow-100" />
        <div className="h-6 w-24 rounded-full bg-neutral-100" />
        <div className="h-6 w-28 rounded-full bg-neutral-100" />
      </div>
      <div className="space-y-2">
        <div className="h-7 max-w-full rounded bg-neutral-200 sm:w-80" />
        <Line w="w-11/12" />
        <Line w="w-10/12" />
        <Line w="w-9/12" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="h-6 w-36 rounded bg-neutral-200" />
          <div className="h-4 w-14 rounded bg-neutral-200" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ProjectPreviewSkeleton />
          <ProjectPreviewSkeleton />
          <ProjectPreviewSkeleton />
        </div>
      </div>

      <div className="border-t border-neutral-200 pt-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-20 rounded bg-neutral-200" />
              <div className="h-6 w-10 rounded-full bg-neutral-100" />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="h-6 w-20 rounded-full bg-neutral-100" />
              <div className="h-6 w-24 rounded-full bg-neutral-100" />
              <div className="h-6 w-22 rounded-full bg-neutral-100" />
            </div>
          </div>
          <div className="h-9 w-28 rounded-full border border-neutral-200 bg-white" />
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
        <div className="mt-3 h-5 max-w-full rounded bg-neutral-200 sm:w-152" />

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

      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start xl:gap-8">
        <div className="space-y-6">
          {[true, false, true].map((withBanner, i) => (
            <SigSectionSkeleton key={`sig-${i}`} withBanner={withBanner} />
          ))}
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-24 rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="h-4 w-28 rounded bg-neutral-200" />
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                <div className="h-4 w-20 rounded bg-neutral-200" />
                <div className="mt-2 h-8 w-14 rounded bg-neutral-200" />
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                <div className="h-4 w-24 rounded bg-neutral-200" />
                <div className="mt-2 h-8 w-14 rounded bg-neutral-200" />
              </div>
            </div>
            <div className="mt-5 border-t border-neutral-200 pt-5">
              <div className="h-4 w-24 rounded bg-neutral-200" />
              <div className="mt-3 space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-start gap-3 rounded-2xl border border-neutral-100 px-3 py-2">
                    <div className="h-7 w-8 rounded-full bg-neutral-100" />
                    <div className="mt-1 h-4 flex-1 rounded bg-neutral-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
