'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type Dir = 'next' | 'prev'

interface UseCarouselOptions {
  total: number
  intervalMs: number
  startAutoPlay: boolean
}

export const useCarousel = ({
  total,
  intervalMs,
  startAutoPlay,
}: UseCarouselOptions) => {
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState<Dir>('next')
  const [paused, setPaused] = useState(false)

  const timerRef = useRef<number | null>(null)
  const pointerStartX = useRef<number | null>(null)
  const wasFocused = useRef(false)

  const prefersReducedMotion
    = typeof window !== 'undefined'
      && window.matchMedia !== undefined
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const effectiveAutoPlay = startAutoPlay && !prefersReducedMotion && !paused

  // ---------- Navigation ----------
  const setSlide = useCallback(
    (to: number) => {
      if (to === index) {
        return
      }
      setDir(to > index ? 'next' : 'prev')
      setIndex(((to % total) + total) % total)
    },
    [index, total],
  )

  const goNext = useCallback(() => {
    setDir('next')
    setIndex(i => (i + 1) % total)
  }, [total])

  const goPrev = useCallback(() => {
    setDir('prev')
    setIndex(i => (i - 1 + total) % total)
  }, [total])

  // ---------- Auto-play ----------
  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    if (!effectiveAutoPlay) {
      return
    }
    timerRef.current = window.setInterval(() => {
      goNext()
    }, intervalMs) as unknown as number
  }, [clearTimer, goNext, effectiveAutoPlay, intervalMs])

  useEffect(() => {
    startTimer()
    return clearTimer
  }, [startTimer, clearTimer, index])

  // Pause when tab is hidden (prevents surprise jumps)
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        setPaused(true)
      }
      else if (!prefersReducedMotion) {
        setPaused(false)
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [prefersReducedMotion])

  // ---------- Keyboard ----------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Only react when carousel (or its children) has focus
      if (!wasFocused.current) {
        return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      }
      else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      }
      else if (e.key.toLowerCase() === ' ') {
        e.preventDefault()
        setPaused(p => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goPrev])

  // ---------- Pointer (touch) swipe ----------
  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    pointerStartX.current = e.touches[0].clientX
  }

  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (pointerStartX.current == null) {
      return
    }
    const dx = e.changedTouches[0].clientX - pointerStartX.current
    pointerStartX.current = null
    const minSwipe = 50
    if (dx <= -minSwipe) {
      goNext()
    }
    else if (dx >= minSwipe) {
      goPrev()
    }
  }

  return {
    // state
    index,
    dir,
    paused,
    setPaused,

    // derived
    prefersReducedMotion,
    total,

    // nav
    setSlide,
    goNext,
    goPrev,

    // touch handlers
    onTouchStart,
    onTouchEnd,

    // refs (exposed as-is, matching your version)
    wasFocusedRef: wasFocused,
  }
}
