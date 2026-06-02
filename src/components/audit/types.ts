import type {
  ArchivedLogManifest,
  OpsLogEntry,
} from '@/lib/ops/audit-logs'
import type { OpsLogSourceId } from '@/lib/ops/logging'

export type RunStatus = 'failure' | 'running' | 'skipped' | 'success' | 'warning'
export type TimeRange = '7d' | '30d' | 'all'

export interface AuditFilters {
  q: string
  source: OpsLogSourceId | 'all'
  status: RunStatus | 'all'
  table: string
  range: TimeRange
}

export interface AuditConsoleProps {
  archivedManifests: ArchivedLogManifest[]
  filters: AuditFilters
  logs: OpsLogEntry[]
  selectedKey?: string
}

export interface AuditRun {
  durationMs?: number
  entries: OpsLogEntry[]
  key: string
  primary: OpsLogEntry
  recordCount?: number
  sourceLabel: string
  status: RunStatus
  summary: string
  tableNames: string[]
  timestamp?: number
  title: string
}
