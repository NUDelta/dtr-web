import type { ReactNode } from 'react'
import type { CityGroup } from './useAlumniMap'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface CityDetailsPortalProps {
  group: CityGroup
  markerRef: React.RefObject<SVGGElement | null>
  containerRef: React.RefObject<HTMLDivElement | null>
  zoom: number
  onClose: (e: React.MouseEvent) => void
}

const CityDetailsPortal = ({
  group,
  markerRef,
  containerRef,
  zoom,
  onClose,
}: CityDetailsPortalProps) => {
  const [pos, setPos] = useState<{ left: number, top: number, flipX: boolean, flipY: boolean }>({ left: 0, top: 0, flipX: false, flipY: false })
  const panelRef = useRef<HTMLDivElement>(null)

  const compute = useCallback(() => {
    const c = containerRef.current
    const m = markerRef.current
    const p = panelRef.current
    if (!c || !m || !p) {
      return
    }

    const cR = c.getBoundingClientRect()
    const mR = m.getBoundingClientRect()
    const pR = p.getBoundingClientRect()

    const margin = 8

    // Default offset: right and slightly above the dot (scale offset a bit with zoom for feel)
    const dx = 12
    const dy = -12

    let left = (mR.left - cR.left) + dx * zoom
    let top = (mR.top - cR.top) + dy * zoom
    let flipX = false
    let flipY = false

    // If overflowing right → flip to left
    if (left + pR.width + margin > cR.width) {
      left = (mR.left - cR.left) - dx * zoom - pR.width
      flipX = true
    }
    // If overflowing left even after flip → clamp
    if (left < margin) {
      left = margin
    }

    // If overflowing top → place below
    if (top < margin) {
      top = (mR.top - cR.top) + (12 * zoom)
      flipY = true
    }
    // If overflowing bottom → lift up
    if (top + pR.height + margin > cR.height) {
      top = (mR.top - cR.top) - (12 * zoom) - pR.height
      flipY = false
    }

    setPos({ left, top, flipX, flipY })
  }, [containerRef, markerRef, zoom])

  // Recompute placement on mount, zoom, resize
  useLayoutEffect(() => {
    compute()
    // re-run on zoom or when switching city
  }, [zoom, group.key, compute])

  useEffect(() => {
    const on = () => compute()
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [compute])

  const panel: ReactNode = (
    <div
      ref={panelRef}
      data-panel
      onClick={e => e.stopPropagation()}
      className="absolute z-10 select-text rounded-xl border bg-white shadow-lg"
      style={{ left: pos.left, top: pos.top, maxWidth: 340 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold text-gray-900">
            {group.city}
            ,
            {group.state}
            {' '}
            —
            {group.people.length}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border bg-gray-50 text-gray-600 hover:bg-gray-100"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Scrollable list (adaptive height; small, pleasant padding) */}
      <div className="max-h-56 overflow-auto px-3 pb-3">
        <ul className="divide-y">
          {group.people.map((p, i) => (
            <li key={i} className="py-2">
              <div className="truncate text-[13px] text-gray-900">
                <span className="font-medium">{p.name}</span>
                <span className="text-gray-600">
                  {' '}
                  @
                  {p.company}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  // Render into the map container for correct stacking/positioning
  if (!containerRef.current) {
    return null
  }

  return createPortal(panel, containerRef.current)
}

export default CityDetailsPortal
