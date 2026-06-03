import type { AuditConsoleProps } from './lib/types'
import { Suspense } from 'react'
import AuditFilters from './AuditFilters'
import AuditHeader from './AuditHeader'
import RunDetail, { RunDetailSkeleton } from './detail/RunDetail'
import RunDetailLoader from './detail/RunDetailLoader'
import HealthCards from './HealthCards'
import { filterRuns, getUniqueTables } from './lib/filtering'
import { getSelectedRun } from './lib/runGrouping'
import RecentRuns from './RecentRuns'

const RECENT_RUNS_PAGE_SIZE = 8

export default function AuditConsole({
  filters,
  selectedKey,
  summaries,
}: AuditConsoleProps) {
  const visibleRuns = filterRuns(summaries, {
    page: 1,
    q: '',
    range: '7d',
    source: 'all',
    status: 'all',
    table: '',
  })
  const tables = getUniqueTables(visibleRuns)
  const filteredRuns = filterRuns(summaries, filters)
  const pageCount = Math.max(1, Math.ceil(filteredRuns.length / RECENT_RUNS_PAGE_SIZE))
  const selectedIndex = selectedKey === undefined
    ? -1
    : filteredRuns.findIndex(run => run.detailKey === selectedKey || run.key === selectedKey)
  const selectedPage = selectedIndex >= 0
    ? Math.floor(selectedIndex / RECENT_RUNS_PAGE_SIZE) + 1
    : undefined
  const currentPage = selectedPage ?? Math.min(filters.page, pageCount)
  const pageStart = (currentPage - 1) * RECENT_RUNS_PAGE_SIZE
  const pageRuns = filteredRuns.slice(pageStart, pageStart + RECENT_RUNS_PAGE_SIZE)
  const selectedRun = getSelectedRun(filteredRuns, selectedKey)
  const pageFilters = currentPage === filters.page ? filters : { ...filters, page: currentPage }

  return (
    <section className="min-h-screen px-4 py-8 text-neutral-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-500">
        <AuditHeader summaries={visibleRuns} />
        <HealthCards summaries={summaries} />
        <AuditFilters filters={pageFilters} tables={tables} />
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
          <RecentRuns
            filters={pageFilters}
            page={currentPage}
            pageCount={pageCount}
            pageSize={RECENT_RUNS_PAGE_SIZE}
            runs={pageRuns}
            selectedKey={selectedRun?.detailKey}
            total={filteredRuns.length}
          />
          {selectedRun === undefined
            ? <RunDetail filters={pageFilters} />
            : (
                <Suspense
                  fallback={<RunDetailSkeleton run={selectedRun} />}
                  key={selectedRun.detailKey}
                >
                  <RunDetailLoader filters={pageFilters} run={selectedRun} />
                </Suspense>
              )}
        </div>
      </div>
    </section>
  )
}
