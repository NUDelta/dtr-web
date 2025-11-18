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
        <h1 className="text-4xl font-semibold tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="mt-1 max-w-2xl text-lg text-gray-600">
          Find answers to common questions about DTR, our programs, and how to get involved.
        </p>
        <p className="mt-1 text-sm text-gray-500">Loading FAQs…</p>
      </header>

      <section aria-label="FAQ" className="space-y-4 pb-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <FaqItemSkeleton key={i} />
        ))}
      </section>
    </main>
  )
}

function FaqItemSkeleton() {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow-sm">
      {/* Question line */}
      <div className="flex items-start gap-3">
        <div
          className="mt-1 h-5 w-5 flex-none rounded-full bg-gray-100"
          aria-hidden
        />
        <div className="flex-1 space-y-2">
          <div
            className="h-5 w-3/4 animate-pulse rounded bg-gray-200"
            aria-hidden
          />
        </div>
      </div>

      {/* Answer lines */}
      <div className="mt-3 space-y-2 pl-8">
        <div
          className="h-4 w-full animate-pulse rounded bg-gray-200"
          aria-hidden
        />
        <div
          className="h-4 w-11/12 animate-pulse rounded bg-gray-200"
          aria-hidden
        />
        <div
          className="h-4 w-10/12 animate-pulse rounded bg-gray-200"
          aria-hidden
        />
        <div
          className="h-4 w-9/12 animate-pulse rounded bg-gray-200"
          aria-hidden
        />
      </div>
    </article>
  )
}
