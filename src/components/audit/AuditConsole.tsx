import type { AuditConsoleProps } from './types'
import { Suspense } from 'react'
import AuditFilters from './AuditFilters'
import AuditHeader from './AuditHeader'
import HealthCards from './HealthCards'
import RecentRuns from './RecentRuns'
import RunDetail, { RunDetailSkeleton } from './RunDetail'
import RunDetailLoader from './RunDetailLoader'
import {
  filterRuns,
  getSelectedRun,
} from './utils'

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
  })
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
        <AuditFilters filters={pageFilters} />
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
            ? <RunDetail />
            : (
                <Suspense
                  fallback={<RunDetailSkeleton run={selectedRun} />}
                  key={selectedRun.detailKey}
                >
                  <RunDetailLoader run={selectedRun} />
                </Suspense>
              )}
        </div>
      </div>
    </section>
  )
}
