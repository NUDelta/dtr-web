'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { usePeopleDirectory } from '@/hooks/usePeopleDirectory'
import AlumniMap from './AlumniMap'
import RoleBlock from './RoleBlock'

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

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <header className="pb-4 pt-6 sm:pt-10">
        <h1 className="text-3xl font-semibold tracking-tight">People</h1>
        <p className="mt-1 max-w-2xl text-gray-600">Browse faculty, students, and alumni.</p>

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
                className={`relative z-10 inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${status === s ? 'text-white' : 'text-gray-600 '}`}
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
                className={`relative z-10 inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${view === key ? 'text-white' : 'text-gray-600'}`}
                title={label}
              >
                <span>{label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </header>

      {status === 'Alumni' && (
        <AlumniMap
          csvUrl="/data/alumni_roster.csv"
          gazetteerUrl="/data/us_cities_all.json"
          title="Where our alumni are"
        />
      )}

      <section aria-label="Directory" className="space-y-6 pb-10">
        <AnimatePresence initial={false} mode="popLayout">
          {grouped.map(({ role, people }) => (
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
      </section>
    </main>
  )
}

export default PeopleDirectory
