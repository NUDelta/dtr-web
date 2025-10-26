import type { CityGroup } from './utils'
import { useRef } from 'react'
import CityDetailsPortal from './CityDetailsPortal'
import CityHoverLabel from './CityHoverLabel'

const CityMarkerContent = ({
  group,
  hover,
  selected,
  containerRef,
  zoom,
  onClose,
}: {
  group: CityGroup
  hover: boolean
  selected: boolean
  containerRef: React.RefObject<HTMLDivElement | null>
  zoom: number
  onClose: (e: React.MouseEvent) => void
}) => {
  const markerRef = useRef<SVGGElement>(null)

  return (
    <g ref={markerRef}>
      {/* Dot */}
      <circle r={hover ? 6.5 : 5} fill="#F59E0B" stroke="#B45309" strokeWidth={1} />

      {/* Hover label: city only (SVG for crisp anchor) */}
      {hover && <CityHoverLabel city={group.city} />}

      {/* Selected: HTML overlay via portal */}
      {selected && (
        <CityDetailsPortal
          group={group}
          markerRef={markerRef}
          containerRef={containerRef}
          zoom={zoom}
          onClose={onClose}
        />
      )}
    </g>
  )
}

export default CityMarkerContent
