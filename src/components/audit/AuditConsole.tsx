import type { AuditConsoleProps } from './types'
import ArchivedSnapshots from './ArchivedSnapshots'
import AuditFilters from './AuditFilters'
import AuditHeader from './AuditHeader'
import HealthCards from './HealthCards'
import RecentRuns from './RecentRuns'
import RunDetail from './RunDetail'
import {
  filterLogs,
  getSelectedRun,
  getUniqueTables,
  groupAuditRuns,
} from './utils'

export default function AuditConsole({
  archivedManifests,
  filters,
  logs,
  selectedKey,
}: AuditConsoleProps) {
  const visibleLogs = filterLogs(logs, {
    q: '',
    range: '7d',
    source: 'all',
    status: 'all',
    table: '',
  })
  const tables = getUniqueTables(visibleLogs)
  const filteredLogs = filterLogs(logs, filters)
  const runs = groupAuditRuns(filteredLogs)
  const selectedRun = getSelectedRun(runs, selectedKey)

  return (
    <section className="min-h-screen px-4 py-8 text-neutral-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-500">
        <AuditHeader logs={visibleLogs} />
        <HealthCards archivedManifests={archivedManifests} logs={logs} />
        <AuditFilters filters={filters} tables={tables} />
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(340px,0.9fr)_minmax(0,1.1fr)]">
          <RecentRuns
            filters={filters}
            runs={runs}
            selectedKey={selectedRun?.key}
          />
          <RunDetail filters={filters} run={selectedRun} />
        </div>
        <ArchivedSnapshots manifests={archivedManifests} />
      </div>
    </section>
  )
}
