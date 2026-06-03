import type { AuditConsoleProps } from './types'
import AuditFilters from './AuditFilters'
import AuditHeader from './AuditHeader'
import HealthCards from './HealthCards'
import RecentRuns from './RecentRuns'
import RunDetail from './RunDetail'
import {
  attachSelectedDetail,
  filterRuns,
  getSelectedRun,
  getUniqueTables,
} from './utils'

export default function AuditConsole({
  filters,
  selectedDetail,
  selectedKey,
  summaries,
}: AuditConsoleProps) {
  const visibleRuns = filterRuns(summaries, {
    q: '',
    range: '7d',
    source: 'all',
    status: 'all',
    table: '',
  })
  const tables = getUniqueTables(visibleRuns)
  const filteredRuns = filterRuns(summaries, filters)
  const runs = attachSelectedDetail(filteredRuns, selectedDetail)
  const selectedRun = getSelectedRun(runs, selectedKey)

  return (
    <section className="min-h-screen px-4 py-8 text-neutral-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-500">
        <AuditHeader summaries={visibleRuns} />
        <HealthCards summaries={summaries} />
        <AuditFilters filters={filters} tables={tables} />
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(340px,0.9fr)_minmax(0,1.1fr)]">
          <RecentRuns
            filters={filters}
            runs={runs}
            selectedKey={selectedRun?.detailKey}
          />
          <RunDetail filters={filters} run={selectedRun} />
        </div>
      </div>
    </section>
  )
}
