import { ABBR_TO_FULL, FULL_TO_ABBR } from './consts'

export interface AlumniRow { name: string, company: string, city: string, state: string }
export interface GazetteerRow { city: string, state: string, lat: number, lon: number }

export interface CityGroup {
  key: string
  city: string
  state: string
  lonLat?: [number, number]
  people: { name: string, company: string }[]
}

export function titleCase(s: string) {
  return s.toLowerCase().replace(/\b\w/g, m => m.toUpperCase())
}

export function normalizeStateName(s: string): string | null {
  if (!s) {
    return null
  }
  const t = s.trim()
  const abbr = t.toUpperCase()
  if (ABBR_TO_FULL[abbr]) {
    return ABBR_TO_FULL[abbr]
  }
  const tc = titleCase(t)
  if (FULL_TO_ABBR[tc]) {
    return tc
  }
  return null
}

// CSV row → AlumniRow (supports Employment/Company/Employer)
export function parseRow(row: Record<string, any>): AlumniRow | null {
  const get = (...keys: string[]) => {
    for (const k of keys) {
      if (row[k] != null && String(row[k]).trim() !== '') {
        return String(row[k]).trim()
      }
    }
    return ''
  }
  const name = get('Name', 'name')
  const company = get('Employment', 'employment', 'Company', 'company', 'Employer', 'employer')
  const city = get('City', 'city')
  const rawState = get('State', 'state', 'St')
  const state = normalizeStateName(rawState || '')
  if (!name || !company || !city || state === null) {
    return null
  }
  return { name, company, city, state }
}

// Build gazetteer index: supports lookups with either full state or abbr keys
export function buildGazetteerIndex(list: GazetteerRow[]) {
  const m = new Map<string, [number, number]>()
  for (const r of list) {
    const full = normalizeStateName(r.state) ?? r.state
    const abbr = FULL_TO_ABBR[full] || r.state.toUpperCase()
    const k1 = `${r.city.toLowerCase()}, ${full.toLowerCase()}`
    const k2 = `${r.city.toLowerCase()}, ${abbr.toLowerCase()}`
    m.set(k1, [r.lon, r.lat])
    m.set(k2, [r.lon, r.lat])
  }
  return m
}

export function aggregate(
  alumni: AlumniRow[],
  gaz: Map<string, [number, number]>,
): { stateCounts: Record<string, number>, cityGroups: Map<string, CityGroup>, maxStateCount: number } {
  const stateCounts: Record<string, number> = {}
  const cityGroups = new Map<string, CityGroup>()

  for (const r of alumni) {
    stateCounts[r.state] = (stateCounts[r.state] || 0) + 1
    const key = `${r.city}, ${r.state}`
    if (!cityGroups.has(key)) {
      const k1 = `${r.city.toLowerCase()}, ${r.state.toLowerCase()}`
      const k2 = `${r.city.toLowerCase()}, ${(FULL_TO_ABBR[r.state] || '').toLowerCase()}`
      cityGroups.set(key, {
        key,
        city: r.city,
        state: r.state,
        lonLat: gaz.get(k1) || gaz.get(k2),
        people: [],
      })
    }
    cityGroups.get(key)!.people.push({ name: r.name, company: r.company })
  }

  const maxStateCount = Object.values(stateCounts).reduce((m, v) => Math.max(m, v), 0)
  return { stateCounts, cityGroups, maxStateCount }
}
