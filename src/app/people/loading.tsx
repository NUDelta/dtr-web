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
    <div className="mx-auto mb-8 max-w-4xl space-y-8">
      { }
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4 md:flex-row">
          {/* Left side - Avatar */}
          <div className="w-52 h-52 shrink-0 rounded-md bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer" />

          {/* Right side - Text */}
          <div className="flex flex-col space-y-3 w-full">
            {/* Name */}
            <div className="h-6 w-1/3 rounded-md bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer" />
            {/* Title */}
            <div className="h-4 w-1/4 rounded-md bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer" />
            {/* Description */}
            <div className="h-4 w-full rounded-md bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer" />
            <div className="h-4 w-3/4 rounded-md bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer" />
            <div className="h-4 w-5/6 rounded-md bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
