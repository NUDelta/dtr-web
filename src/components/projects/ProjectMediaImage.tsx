'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Maximize2, Minus, Plus, Scan, X } from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AdaptiveImage } from '@/components/shared'

interface ProjectMediaImageProps {
  src: string
  alt: string
  sizes: string
  containerClassName: string
  imageClassName: string
}

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const ZOOM_STEP = 0.5
const ALIGNMENT_OVERFLOW_THRESHOLD = 64
const focusableSelectors = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
}

function formatZoom(value: number): string {
  return value === MIN_ZOOM ? 'Fit' : `${value.toFixed(1).replace(/\.0$/, '')}x`
}

function IconButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: React.ReactNode
  disabled?: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}

export default function ProjectMediaImage({
  src,
  alt,
  sizes,
  containerClassName,
  imageClassName,
}: ProjectMediaImageProps) {
  const [open, setOpen] = useState(false)
  const [zoom, setZoom] = useState(MIN_ZOOM)
  const [naturalSize, setNaturalSize] = useState<{ height: number, width: number } | null>(null)
  const [viewerSize, setViewerSize] = useState<{ height: number, width: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const titleId = useId()
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const viewerRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{
    left: number
    pointerId: number
    top: number
    x: number
    y: number
  } | null>(null)

  const openViewer = () => {
    setZoom(MIN_ZOOM)
    setDragging(false)
    dragRef.current = null
    setOpen(true)
  }

  const closeViewer = useCallback(() => {
    setOpen(false)
    setZoom(MIN_ZOOM)
    setDragging(false)
    dragRef.current = null
  }, [])

  const setViewerZoom = useCallback((nextZoom: number | ((currentZoom: number) => number)) => {
    setDragging(false)
    dragRef.current = null
    setZoom(value => clampZoom(typeof nextZoom === 'function' ? nextZoom(value) : nextZoom))
  }, [])

  const zoomOut = useCallback(() => setViewerZoom(value => value - ZOOM_STEP), [setViewerZoom])
  const zoomIn = useCallback(() => setViewerZoom(value => value + ZOOM_STEP), [setViewerZoom])
  const resetZoom = useCallback(() => setViewerZoom(MIN_ZOOM), [setViewerZoom])

  const fittedSize = useMemo(() => {
    if (naturalSize === null || viewerSize === null) {
      return null
    }

    const scale = Math.min(
      1,
      viewerSize.width / naturalSize.width,
      viewerSize.height / naturalSize.height,
    )

    return {
      height: Math.max(1, naturalSize.height * scale),
      width: Math.max(1, naturalSize.width * scale),
    }
  }, [naturalSize, viewerSize])

  const zoomedSize = useMemo(() => {
    return fittedSize === null
      ? null
      : {
          height: fittedSize.height * zoom,
          width: fittedSize.width * zoom,
        }
  }, [fittedSize, zoom])
  const overflowsX = zoomedSize !== null
    && viewerSize !== null
    && zoomedSize.width > viewerSize.width + ALIGNMENT_OVERFLOW_THRESHOLD
  const overflowsY = zoomedSize !== null
    && viewerSize !== null
    && zoomedSize.height > viewerSize.height + ALIGNMENT_OVERFLOW_THRESHOLD

  useEffect(() => {
    if (!open) {
      return
    }

    const body = document.body
    const originalOverflow = body.style.overflow
    const triggerButton = triggerRef.current
    body.style.overflow = 'hidden'
    dialogRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeViewer()
      }
      else if (event.key === 'Tab') {
        const dialog = dialogRef.current
        if (dialog === null) {
          return
        }

        const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelectors))
        if (focusable.length === 0) {
          event.preventDefault()
          dialog.focus()
          return
        }

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        }
        else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
      else if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        zoomIn()
      }
      else if (event.key === '-') {
        event.preventDefault()
        zoomOut()
      }
      else if (event.key === '0') {
        event.preventDefault()
        resetZoom()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      body.style.overflow = originalOverflow
      document.removeEventListener('keydown', handleKeyDown)
      triggerButton?.focus()
    }
  }, [closeViewer, open, resetZoom, zoomIn, zoomOut])

  useEffect(() => {
    if (zoomedSize === null || viewerSize === null || zoom === MIN_ZOOM) {
      return
    }

    const scrollArea = scrollRef.current
    if (scrollArea === null) {
      return
    }

    scrollArea.scrollTo({
      left: 0,
      top: 0,
    })
  }, [viewerSize, zoom, zoomedSize])

  useEffect(() => {
    if (!open) {
      return
    }

    const viewer = viewerRef.current
    if (viewer === null) {
      return
    }

    const updateViewerSize = () => {
      const style = getComputedStyle(viewer)
      const width = viewer.clientWidth
        - Number.parseFloat(style.paddingLeft)
        - Number.parseFloat(style.paddingRight)
      const height = viewer.clientHeight
        - Number.parseFloat(style.paddingTop)
        - Number.parseFloat(style.paddingBottom)

      setViewerSize({
        height: Math.max(1, height),
        width: Math.max(1, width),
      })
    }

    const observer = new ResizeObserver(updateViewerSize)
    observer.observe(viewer)

    return () => {
      observer.disconnect()
    }
  }, [open])

  const modal = typeof document === 'undefined'
    ? null
    : createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              className="fixed inset-0 z-50 flex flex-col bg-neutral-950/95 p-3 text-white sm:p-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  closeViewer()
                }
              }}
            >
              <motion.div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className="flex min-h-0 flex-1 flex-col outline-none"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                onMouseDown={event => event.stopPropagation()}
              >
                <header className="flex flex-wrap items-center justify-between gap-3 pb-3">
                  <h2 id={titleId} className="min-w-0 flex-1 truncate text-sm font-semibold text-white/90 sm:text-base">
                    {alt}
                  </h2>
                  <div className="flex items-center gap-2">
                    <IconButton
                      label="Zoom out"
                      onClick={zoomOut}
                      disabled={zoom <= MIN_ZOOM}
                    >
                      <Minus className="size-4" aria-hidden="true" />
                    </IconButton>
                    <span className="min-w-12 text-center text-sm font-semibold tabular-nums text-white/80">
                      {formatZoom(zoom)}
                    </span>
                    <IconButton
                      label="Zoom in"
                      onClick={zoomIn}
                      disabled={zoom >= MAX_ZOOM}
                    >
                      <Plus className="size-4" aria-hidden="true" />
                    </IconButton>
                    <IconButton
                      label="Fit to screen"
                      onClick={resetZoom}
                      disabled={zoom === MIN_ZOOM}
                    >
                      <Scan className="size-4" aria-hidden="true" />
                    </IconButton>
                    <IconButton label="Close image viewer" onClick={closeViewer}>
                      <X className="size-5" aria-hidden="true" />
                    </IconButton>
                  </div>
                </header>
                <div
                  ref={scrollRef}
                  className={[
                    'min-h-0 flex-1 overflow-auto rounded-2xl border border-white/10 bg-black/30',
                    zoom > MIN_ZOOM ? 'cursor-grab active:cursor-grabbing' : '',
                  ].filter(Boolean).join(' ')}
                  onPointerDown={(event) => {
                    if (zoom === MIN_ZOOM) {
                      return
                    }

                    const scrollArea = scrollRef.current
                    if (scrollArea === null) {
                      return
                    }

                    dragRef.current = {
                      left: scrollArea.scrollLeft,
                      pointerId: event.pointerId,
                      top: scrollArea.scrollTop,
                      x: event.clientX,
                      y: event.clientY,
                    }
                    setDragging(true)
                    scrollArea.setPointerCapture(event.pointerId)
                  }}
                  onPointerMove={(event) => {
                    const drag = dragRef.current
                    const scrollArea = scrollRef.current
                    if (drag === null || scrollArea === null) {
                      return
                    }

                    scrollArea.scrollLeft = drag.left - (event.clientX - drag.x)
                    scrollArea.scrollTop = drag.top - (event.clientY - drag.y)
                  }}
                  onPointerUp={(event) => {
                    const scrollArea = scrollRef.current
                    if (dragRef.current?.pointerId === event.pointerId) {
                      dragRef.current = null
                      setDragging(false)
                      scrollArea?.releasePointerCapture(event.pointerId)
                    }
                  }}
                  onPointerCancel={(event) => {
                    const scrollArea = scrollRef.current
                    if (dragRef.current?.pointerId === event.pointerId) {
                      dragRef.current = null
                      setDragging(false)
                      scrollArea?.releasePointerCapture(event.pointerId)
                    }
                  }}
                >
                  <div
                    ref={viewerRef}
                    className="flex min-h-full min-w-full p-3 sm:p-6"
                    style={{
                      alignItems: overflowsY ? 'flex-start' : 'center',
                      justifyContent: overflowsX ? 'flex-start' : 'center',
                    }}
                  >
                    <AdaptiveImage
                      src={src}
                      alt={alt}
                      sizes="100vw"
                      pictureClassName="contents"
                      className={[
                        'block h-auto select-none object-contain',
                        dragging ? 'pointer-events-none' : '',
                      ].filter(Boolean).join(' ')}
                      draggable={false}
                      onLoad={(event) => {
                        const img = event.currentTarget
                        setNaturalSize({
                          height: img.naturalHeight,
                          width: img.naturalWidth,
                        })
                      }}
                      style={{
                        height: zoomedSize === null ? undefined : `${zoomedSize.height}px`,
                        maxWidth: 'none',
                        width: zoomedSize === null ? undefined : `${zoomedSize.width}px`,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Open ${alt} full screen`}
        onClick={openViewer}
        className={`${containerClassName} group relative cursor-zoom-in transition focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2`}
      >
        <AdaptiveImage
          src={src}
          alt={alt}
          sizes={sizes}
          pictureClassName="contents"
          className={imageClassName}
        />
        <span className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-xl border border-white/70 bg-white/85 text-neutral-900 opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <Maximize2 className="size-4" aria-hidden="true" />
        </span>
      </button>
      {modal}
    </>
  )
}
