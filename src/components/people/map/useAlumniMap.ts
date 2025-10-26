'use client'

import type { AlumniRow, CityGroup, GazetteerRow } from './utils'
import { scaleLinear } from 'd3-scale'
import Papa from 'papaparse'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { STATE_COLOR_RANGE } from './consts'
import { aggregate, buildGazetteerIndex, parseRow } from './utils'

interface UseAlumniMapOpts {
  csvUrl: string
  gazetteerUrl: string
}

export function useAlumniMap({ csvUrl, gazetteerUrl }: UseAlumniMapOpts) {
  const [alumni, setAlumni] = useState<AlumniRow[]>([])
  const [gaz, setGaz] = useState<Map<string, [number, number]>>(new Map())
  const [err, setErr] = useState<string | null>(null)
  // Load alumni CSV
  const [loading, startTransition] = useTransition()

  // UI state
  const [hoverKey, setHoverKey] = useState<string | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState<[number, number]>([-97, 38]) // US center-ish

  useEffect(() => {
    startTransition(async () => {
      try {
        const res = await fetch(csvUrl, { cache: 'no-store' })
        if (!res.ok) {
          throw new Error(`Failed to fetch ${csvUrl}`)
        }
        const text = await res.text()
        const parsed = Papa.parse<Record<string, any>>(text, { header: true, skipEmptyLines: true })
        const rows = parsed.data.map(parseRow).filter((x): x is AlumniRow => !!x)
        setAlumni(rows)
      }
      catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to load alumni CSV'
        setErr(message)
      }
    })
  }, [csvUrl])

  // Load gazetteer JSON
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(gazetteerUrl, { cache: 'force-cache' })
        if (!res.ok) {
          throw new Error(`Failed to fetch ${gazetteerUrl}`)
        }
        const list = await res.json() as GazetteerRow[]
        setGaz(buildGazetteerIndex(list))
      }
      catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to load gazetteer'
        console.warn('Gazetteer load error:', message)
      }
    })()
  }, [gazetteerUrl])

  const { stateCounts, cityGroups, maxStateCount } = useMemo(
    () => aggregate(alumni, gaz),
    [alumni, gaz],
  )

  const colorScale = useMemo(
    () => scaleLinear<string>().domain([0, Math.max(1, maxStateCount)]).range(STATE_COLOR_RANGE),
    [maxStateCount],
  )

  const hovered = hoverKey !== null ? cityGroups.get(hoverKey) || null : null
  const selected = selectedKey !== null ? cityGroups.get(selectedKey) || null : null

  return {
    // data
    loading,
    err,
    colorScale,
    stateCounts,
    cityGroups,

    // ui state
    hoverKey,
    setHoverKey,
    selectedKey,
    setSelectedKey,
    hovered,
    selected,

    // zoom/pan
    zoom,
    setZoom,
    center,
    setCenter,
  }
}

export type { CityGroup }
