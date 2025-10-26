'use client'

import { AnimatePresence, motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Suspense, useMemo } from 'react'
import { usePeopleDirectory } from '@/hooks/usePeopleDirectory'
import { useSearchQuery } from '@/hooks/useSearch'
import { SearchBar } from '../shared'
import RoleBlock from './RoleBlock'

const AlumniMap = dynamic(async () => import('./AlumniMap'), { ssr: false })

interface PeopleDirectoryProps {
  initialPeople: Person[]
}

const PeopleDirectory = ({ initialPeople }: PeopleDirectoryProps) => {
  const {
    status,
    setStatus,
    view,
    setView,
    countsByStatus,
    grouped,
  } = usePeopleDirectory(initialPeople)

  const { query, setQuery, debouncedQuery, reset } = useSearchQuery('', 300)

  const filteredGrouped = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()
    if (!q) {
      return grouped
    }
    return grouped
      .map(({ role, people }) => ({
        role,
        people: people.filter(p => p.name?.toLowerCase().includes(q)),
      }))
      .filter(({ people }) => people.length > 0)
  }, [grouped, debouncedQuery])

  const totalMatches = useMemo(
    () => filteredGrouped.reduce((acc, g) => acc + g.people.length, 0),
    [filteredGrouped],
  )

  return (
    <>
      <header className="pb-4">
        <h1 className="text-4xl font-semibold tracking-tight">People</h1>
        <p className="mt-1 text-lg max-w-2xl text-gray-600">Browse our faculty, students, and alumni.</p>

        <div className="mt-4">
          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={reset}
            placeholder={`Search ${status.toLowerCase()} by name…`}
            className="mx-auto max-w-xl"
          />
          {/* subtle result count when searching */}
          {debouncedQuery && (
            <p className="mt-2 text-center text-sm text-gray-600">
              {totalMatches}
              {' '}
              match
              {totalMatches === 1 ? '' : 'es'}
              {' '}
              found
            </p>
          )}
        </div>

        {/* Controls row */}
        <motion.div
          className="mt-4 flex flex-wrap items-center gap-2"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Segmented status toggle */}
          <div
            className="relative inline-flex select-none rounded-xl bg-gray-100 p-1"
            role="tablist"
            aria-label="Membership status"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-neutral-900 shadow ring-1 ring-black/5 transition-transform "
              style={{ transform: status === 'Active' ? 'translateX(0)' : 'translateX(100%)' }}
            />
            {(['Active', 'Alumni'] as const).map(s => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={status === s}
                aria-current={status === s ? 'page' : undefined}
                aria-controls="people-results"
                onClick={() => setStatus(s)}
                className={`relative z-10 inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium cursor-pointer transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${status === s ? 'text-white' : 'text-gray-600 '}`}
                title={s}
              >
                <span>{s}</span>
                <span className="ml-1 text-[11px] opacity-70">
                  (
                  {countsByStatus[s]?.toLocaleString?.() ?? 0}
                  )
                </span>
              </button>
            ))}
          </div>

          {/* Segmented view toggle (Card/List) */}
          <div
            className="ml-auto relative inline-flex select-none rounded-xl bg-gray-100 p-1"
            role="tablist"
            aria-label="View mode"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-neutral-900 shadow ring-1 ring-black/5 transition-transform"
              style={{ transform: view === 'card' ? 'translateX(0)' : 'translateX(100%)' }}
            />
            {([
              { key: 'card', label: 'Card' },
              { key: 'list', label: 'List' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={view === key}
                aria-controls="people-results"
                onClick={() => setView(key)}
                className={`relative z-10 inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium cursor-pointer transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${view === key ? 'text-white' : 'text-gray-600'}`}
                title={label}
              >
                <span>{label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </header>

      {status === 'Alumni' && (
        <div className="overflow-hidden transition-all duration-300 ease-in-out">
          <Suspense fallback={(
            <div className="my-6 flex items-center justify-center opacity-0 animate-[fadeIn_0.2s_ease-in-out_forwards]">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                <span>Loading map…</span>
              </div>
            </div>
          )}
          >
            <AlumniMap
              csvUrl="/data/alumni_roster.csv"
              gazetteerUrl="/data/us_cities_all.json"
              title="Where our alumni are"
            />
          </Suspense>
        </div>
      )}

      <section id="people-results" aria-label="Directory" className="space-y-6 pb-10">
        {/* No results state */}
        {debouncedQuery && totalMatches === 0
          ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-600">
                No matches for “
                <span className="font-semibold">{debouncedQuery}</span>
                ” in
                {' '}
                {status.toLowerCase()}
                .
              </div>
            )
          : (
              <AnimatePresence initial={false} mode="popLayout">
                {filteredGrouped.map(({ role, people }) => (
                  <motion.div
                    key={`${role}-${view}-${status}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <RoleBlock
                      status={status}
                      role={role}
                      people={people}
                      view={view}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
      </section>
    </>
  )
}

export default PeopleDirectory
