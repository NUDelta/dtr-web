'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { useCarousel } from '@/hooks/useCarousel'

import { getImageSources } from '@/utils/get-image-sources'

const images = [
  'images/home-carousel/1.jpg',
  'images/home-carousel/2.jpg',
  'images/home-carousel/3.jpg',
  'images/home-carousel/4.jpg',
  'images/home-carousel/5.jpg',
]

type Dir = 'next' | 'prev'

interface CarouselProps {
  className?: string
  intervalMs?: number
  startAutoPlay?: boolean
  aspectClassName?: string // e.g., 'aspect-video' or 'aspect-[16/9]'
}

export default function Carousel({
  className,
  intervalMs = 6000,
  startAutoPlay = true,
  aspectClassName = 'aspect-video',
}: CarouselProps) {
  const id = useId()
  const [loaded, setLoaded] = useState<Record<number, boolean>>({ 0: true })

  const {
    index,
    dir,
    paused,
    setPaused,
    prefersReducedMotion,
    total,
    setSlide,
    goNext,
    goPrev,
    onTouchStart,
    onTouchEnd,
  } = useCarousel({
    total: images.length,
    intervalMs,
    startAutoPlay,
  })

  const sources = getImageSources(images[index])

  const announceId = `${id}-carousel-status`
  const descId = `${id}-carousel-desc`
  // ---------- Animation variants ----------
  const variants = useMemo(
    () => ({
      enter: (d: Dir) => ({
        x: d === 'next' ? '100%' : '-100%',
        opacity: 0,
      }),
      center: { x: 0, opacity: 1 },
      exit: (d: Dir) => ({
        x: d === 'next' ? '-100%' : '100%',
        // keep a bit of presence to avoid "flash"
        opacity: 0.6,
      }),
    }),
    [],
  )

  return (
    <div className={['relative', className].filter(Boolean).join(' ')}>
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Image carousel"
        aria-describedby={descId}
        aria-live="off"
        tabIndex={0}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className={[
          'group relative w-full overflow-hidden rounded-lg',
          // Provide a dark bg for avoiding a white flash between frames
          'bg-black',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          'select-none',
        ].join(' ')}
      >
        {/* Helpful instructions for screen reader users (announced on focus) */}
        <p id={descId} className="sr-only">
          Use Left and Right Arrow keys to navigate slides. Press Space to toggle autoplay. Hover or focus to pause.
        </p>

        <div className={`relative w-full ${aspectClassName}`}>
          {/* AnimatePresence with overlapping enter/exit to avoid blanks */}
          <AnimatePresence initial={false} custom={dir} mode="sync">
            <motion.div
              key={index}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: {
                  type: prefersReducedMotion ? 'tween' : 'spring',
                  stiffness: 300,
                  damping: 35,
                  duration: prefersReducedMotion ? 0.25 : undefined,
                },
                opacity: { duration: 0.25 },
              }}
              className="absolute inset-0 will-change-transform will-change-opacity"
            >
              <picture>
                <source srcSet={sources.avif} type="image/avif" />
                <source srcSet={sources.webp} type="image/webp" />
                <img
                  src={sources.fallback}
                  alt={`Slide ${index + 1} of ${total}`}
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
                  className="absolute inset-0 h-full w-full object-cover"
                  onLoad={() => setLoaded(prev => ({ ...prev, [index]: true }))}
                  draggable={false}
                />
              </picture>
            </motion.div>
          </AnimatePresence>

          {/* Render a tiny crossfade overlay until current slide reports loaded */}
          {!loaded[index] && (
            <div className="absolute inset-0 rounded-lg bg-black/60 pointer-events-none" />
          )}
        </div>

        {/* Prev/Next controls */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 md:px-4">
          <button
            type="button"
            onClick={goPrev}
            className={[
              'pointer-events-auto inline-flex items-center justify-center',
              'rounded-full bg-black/45 text-white p-2 md:p-3',
              'transition-opacity duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2',
              'group transition-all hover:scale-110',
              'backdrop-blur-sm shadow-lg',
            ].join(' ')}
            aria-label="Previous image"
            title="Previous image"
          >
            <ChevronLeft className="h-6 w-6 group-hover:scale-110" />
          </button>

          <button
            type="button"
            onClick={goNext}
            className={[
              'pointer-events-auto inline-flex items-center justify-center',
              'rounded-full bg-black/45 text-white p-2 md:p-3',
              'transition-opacity duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2',
              'group transition-all hover:scale-110',
              'backdrop-blur-sm shadow-lg',
            ].join(' ')}
            aria-label="Next image"
            title="Next image"
          >
            <ChevronRight className="h-6 w-6 group-hover:scale-110" />
          </button>
        </div>

        {/* Play / Pause (WCAG moving content control) */}
        <div className="absolute left-3 top-3 z-10">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-white backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 group transition-transform hover:scale-110"
            aria-pressed={!paused}
            aria-label={paused ? 'Start autoplay' : 'Pause autoplay'}
            onClick={() => setPaused(p => !p)}
            title={paused ? 'Start autoplay' : 'Pause autoplay'}
          >
            {paused
              ? <Play className="h-4 w-4 group-hover:scale-110" />
              : <Pause className="h-4 w-4 group-hover:scale-110" />}
            <span className="sr-only">{paused ? 'Start autoplay' : 'Pause autoplay'}</span>
          </button>
        </div>

        {/* Dots */}
        <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 rounded-full bg-black/45 px-3 py-2 backdrop-blur-sm shadow-lg">
          {images.map((_img, i) => {
            const isActive = i === index
            return (
              <button
                key={images[i]}
                type="button"
                onClick={() => setSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={isActive ? 'true' : undefined}
                className={[
                  'h-2.5 w-2.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2',
                  isActive ? 'bg-white scale-110' : 'bg-white/60 hover:bg-white/85',
                  'transition-transform',
                  'hover:scale-110',
                ].join(' ')}
                title={`Slide ${i + 1}`}
              />
            )
          })}
        </div>

        {/* Live announcement for screen readers (polite & atomic) */}
        <div id={announceId} className="sr-only" aria-live="polite" aria-atomic="true">
          Slide
          {' '}
          {index + 1}
          {' '}
          of
          {' '}
          {total}
        </div>
      </div>

      {/* Credit */}
      <p className="mt-2 text-center text-xs md:text-sm text-gray-500 italic">
        photo credit: matthew zhang
      </p>
    </div>
  )
}
