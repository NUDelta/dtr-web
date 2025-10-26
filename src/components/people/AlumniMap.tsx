'use client'

import { useEffect, useRef } from 'react'
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps'
import CityMarkerContent from './map/CityMarkerContent'
import { GEO_URL } from './map/consts'
import { useAlumniMap } from './map/useAlumniMap'

interface AlumniMapProps {
  csvUrl?: string // default: /data/alumni_roster.csv
  gazetteerUrl?: string // default: /data/us_cities_all.json
  title?: string
}

const geoStyle = {
  default: { outline: 'none' as const },
  hover: { outline: 'none' as const },
  pressed: { outline: 'none' as const },
}

const AlumniMap = ({
  csvUrl = '/data/alumni_roster.csv',
  gazetteerUrl = '/data/us_cities_all.json',
  title = 'Where our alumni are',
}: AlumniMapProps) => {
  const {
    loading,
    err,
    colorScale,
    stateCounts,
    cityGroups,
    hoverKey,
    setHoverKey,
    selectedKey,
    setSelectedKey,
    zoom,
    setZoom,
    center,
    setCenter,
  } = useAlumniMap({ csvUrl, gazetteerUrl })

  const isPanningRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Zoom controls
  const zoomIn = () => setZoom(z => Math.min(8, +(z * 1.5).toFixed(2)))
  const zoomOut = () => setZoom(z => Math.max(1, +(z / 1.5).toFixed(2)))
  const resetView = () => {
    setZoom(1)
    setCenter([-97, 38])
  }

  // TODO: capture click on the container to close the panel. (Currently seems not working)
  useEffect(() => {
    const el = containerRef.current
    if (el === null) {
      return
    }
    const onClickCapture = (e: MouseEvent) => {
      if (isPanningRef.current) {
        return
      }
      const t = e.target as HTMLElement
      // ignore clicks on markers/panels
      if (t.closest('[data-marker]') || t.closest('[data-panel]')) {
        return
      }
      setSelectedKey(null)
    }
    el.addEventListener('click', onClickCapture, true) // capture phase
    return () => el.removeEventListener('click', onClickCapture, true)
  }, [setSelectedKey])

  return (
    <section aria-label="Alumni Map (USA)" className="mx-auto my-6 w-full rounded-2xl border">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          {loading && <span className="text-sm text-gray-600">Loading…</span>}
          {err !== null && <span className="text-sm text-red-600">{err}</span>}
        </div>
      </div>

      <div className="relative" ref={containerRef}>
        {/* Zoom buttons */}
        <div className="pointer-events-auto absolute right-3 top-3 z-10 flex flex-col overflow-hidden rounded-lg border bg-white shadow">
          <button
            type="button"
            className="px-3 py-2 hover:bg-gray-50"
            onClick={zoomIn}
            aria-label="Zoom in"
          >
            +
          </button>
          <div className="h-px bg-gray-200" />
          <button
            type="button"
            className="px-3 py-2 hover:bg-gray-50"
            onClick={zoomOut}
            aria-label="Zoom out"
          >
            −
          </button>
          <div className="h-px bg-gray-200" />
          <button
            type="button"
            className="px-3 py-2 hover:bg-gray-50"
            onClick={resetView}
            aria-label="Reset view"
          >
            Reset
          </button>
        </div>

        <ComposableMap projection="geoAlbersUsa" width={980} height={520} style={{ width: '100%', height: 'auto' }}>
          <ZoomableGroup
            zoom={zoom}
            center={center}
            minZoom={1}
            maxZoom={8}
            onMoveStart={() => { isPanningRef.current = true }}
            onMoveEnd={(p) => {
              setCenter(p.coordinates)
              setZoom(p.zoom)
              setTimeout(() => {
                isPanningRef.current = false
              }, 0)
            }}
          >
            {/* Ocean/canvas catch-all (also closes on click) */}
            <rect x={-2000} y={-1200} width={8000} height={5000} fill="transparent" />

            {/* States */}
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo: { properties: { name: string }, rsmKey: string }) => {
                  const stateName = (geo.properties).name
                  const count = stateCounts[stateName] || 0
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={colorScale(count)}
                      stroke="#E5E7EB"
                      strokeWidth={0.75}
                      style={geoStyle}
                      tabIndex={-1}
                    />
                  )
                })}
            </Geographies>

            {/* City markers */}
            {[...cityGroups.values()]
              .filter(g => !!g.lonLat)
              .map((g) => {
                const isHover = hoverKey === g.key && selectedKey !== g.key
                const isSelected = selectedKey === g.key
                return (
                  <Marker
                    key={g.key}
                    data-marker
                    coordinates={g.lonLat as [number, number]}
                    onMouseEnter={() => setHoverKey(g.key)}
                    onMouseLeave={() => setHoverKey(null)}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedKey(prev => prev === g.key ? null : g.key)
                    }}
                    className="cursor-pointer"
                  >
                    <CityMarkerContent
                      group={g}
                      hover={isHover}
                      selected={isSelected}
                      containerRef={containerRef}
                      zoom={zoom}
                      onClose={(e) => {
                        e.stopPropagation()
                        setSelectedKey(null)
                      }}
                    />
                  </Marker>
                )
              })}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-5 rounded-sm"
            style={{ background: '#FFF7CC', border: '1px solid #FDE68A' }}
          />
          <span className="text-sm text-gray-700">Fewer alumni</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-5 rounded-sm"
            style={{ background: '#F59E0B' }}
          />
          <span className="text-sm text-gray-700">More alumni</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            <circle cx="7" cy="7" r="5" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
          </svg>
          <span className="text-sm text-gray-700">City (hover for name, click for people)</span>
        </div>
      </div>
    </section>
  )
}

export default AlumniMap
