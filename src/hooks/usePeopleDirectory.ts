'use client'

import { useEffect, useMemo, useState } from 'react'

export type StatusTab = 'Active' | 'Alumni'

const MERGED_STUDENT_ROLE = 'Student Researcher'
const STUDENT_ROLES = [
  'Ph.D. Candidate',
  'Ph.D. Student',
  'Masters Student Researcher',
  'Undergraduate Student Researcher',
]

/**
 * Encapsulates People directory state + derived data:
 * - status (Active/Alumni)
 * - keyboard shortcuts (A/U)
 * - document.title sync
 * - counts by status
 * - stable role ordering and grouped people by role for current status
 */
export const usePeopleDirectory = (initialPeople: Person[]) => {
  const [status, setStatus] = useState<StatusTab>('Active')

  // Title sync
  useEffect(() => {
    document.title = `People | DTR — ${status}`
  }, [status])

  // Keyboard: A=Active, U=Alumni
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (k === 'a') {
        setStatus('Active')
      }
      if (k === 'u') {
        setStatus('Alumni')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const countsByStatus = useMemo(
    () => ({
      Active: initialPeople.filter(p => p.status === 'Active').length,
      Alumni: initialPeople.filter(p => p.status === 'Alumni').length,
    }),
    [initialPeople],
  )

  const allRoles = useMemo(() => {
    const set = new Set(initialPeople.map(p => p.role).filter(Boolean))

    // If there are masters / undergrad, remove both and replace with merged role
    if (STUDENT_ROLES.some(r => set.has(r))) {
      for (const r of STUDENT_ROLES) {
        set.delete(r)
      }
      set.add(MERGED_STUDENT_ROLE)
    }

    const preferred = [
      'Faculty',
      MERGED_STUDENT_ROLE,
    ]

    const rest = Array.from(set).filter(r => !preferred.includes(r))

    return [...preferred.filter(r => set.has(r)), ...rest.sort()]
  }, [initialPeople])

  const grouped = useMemo(() => {
    const filtered = initialPeople.filter(p => p.status === status)
    const map = new Map<string, Person[]>()

    for (const p of filtered) {
    // Merge masters / undergrad to a single role.
      const roleKey = STUDENT_ROLES.includes(p.role)
        ? MERGED_STUDENT_ROLE
        : p.role

      if (!map.has(roleKey)) {
        map.set(roleKey, [])
      }
      map.get(roleKey)!.push(p)
    }

    return allRoles
      .filter(r => map.has(r))
      .map(r => ({ role: r, people: map.get(r)! }))
  }, [initialPeople, status, allRoles])

  return {
    status,
    setStatus,
    countsByStatus,
    allRoles,
    grouped,
  }
}
