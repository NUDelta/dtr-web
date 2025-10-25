'use client';

import { startProgress, stopProgress } from 'next-nprogress-bar';
import { useCallback, useEffect } from 'react';

export default function Loading() {
  const stableStartProgress = useCallback(startProgress, []);
  const stableStopProgress = useCallback(stopProgress, []);

  useEffect(() => {
    stableStartProgress();
    return () => stableStopProgress();
  }, [stableStartProgress, stableStopProgress]);

  return (
    <main
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <header className="pb-4 pt-6 sm:pt-10">
        <h1 className="text-3xl font-semibold tracking-tight">People</h1>
        <p className="mt-1 max-w-2xl text-gray-600">Loading directory…</p>

        {/* Controls row */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {/* Segmented status toggle skeleton */}
          <SegmentedSkeleton labels={['Active', 'Alumni']} />

          {/* Segmented view toggle skeleton (Card/List) */}
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
  );
}

function SegmentedSkeleton({ labels }: { labels: string[] }) {
  return (
    <div
      className="inline-flex select-none items-center gap-2 rounded-xl bg-gray-100 p-1 "
      role="tablist"
      aria-label="Loading segmented control"
    >
      {labels.map((label, i) => (
        <div
          key={`${label}-${i}`}
          className="animate-pulse rounded-lg bg-white px-3 py-2 shadow ring-1 ring-black/5 "
          aria-hidden
        >
          <span className="block h-4 w-12 rounded bg-gray-200 " />
        </div>
      ))}
    </div>
  );
}

function RoleBlockSkeleton() {
  return (
    <section className="rounded-2xl border">
      {/* Summary row */}
      <div className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-200 " />
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200 " />
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
        <div className="h-9 w-32 animate-pulse rounded-xl border bg-gray-50 " aria-hidden />
      </div>
    </section>
  );
}

function CardSkeleton() {
  return (
    <article className="overflow-hidden rounded-2xl border shadow-sm">
      {/* Image placeholder */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        <div className="absolute inset-0 animate-pulse bg-gray-200 " aria-hidden />
      </div>

      {/* Text lines */}
      <div className="space-y-2 p-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200 " aria-hidden />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 " aria-hidden />
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-gray-200 " aria-hidden />
          <div className="h-3 w-5/6 animate-pulse rounded bg-gray-200 " aria-hidden />
          <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200 " aria-hidden />
        </div>
        <div className="mt-3 h-8 w-24 animate-pulse rounded-lg bg-gray-100 " aria-hidden />
      </div>
    </article>
  );
}
