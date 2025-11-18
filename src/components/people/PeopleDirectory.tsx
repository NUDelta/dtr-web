'use client'

import { AnimatePresence, motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Suspense, useMemo } from 'react'
import { SearchBar } from '@/components/shared'
import { usePeopleDirectory } from '@/hooks/usePeopleDirectory'
import { useSearchQuery } from '@/hooks/useSearch'
import AlumniMapSkeleton from './AlumniMapSkeleton'
import RoleBlock from './RoleBlock'
import ViewControl from './ViewControl'

const AlumniMap = dynamic(async () => import('./AlumniMap'), { ssr: false })

interface PeopleDirectoryProps {
  initialPeople: Person[]
}

const PeopleDirectory = ({ initialPeople }: PeopleDirectoryProps) => {
  const {
    status,
    setStatus,
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

        <ViewControl
          status={status}
          setStatus={setStatus}
          countsByStatus={countsByStatus}
        />
      </header>

      {status === 'Alumni' && (
        <div className="overflow-hidden transition-all duration-300 ease-in-out">
          <Suspense fallback={<AlumniMapSkeleton />}>
            <AlumniMap
              csvUrl="/data/alumni_roster.csv"
              gazetteerUrl="/data/us_cities_all.json"
              title="Where our alumni are"
              className="h-full w-full"
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
                    key={`${role}-${status}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <RoleBlock role={role} people={people} />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
      </section>
    </>
  )
}

export default PeopleDirectory
