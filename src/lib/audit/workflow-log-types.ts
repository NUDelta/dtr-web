export const WORKFLOW_LOG_PREFIX = 'logs'
export const WORKFLOW_LOG_RETENTION_DAYS = 60

export const OPS_LOG_SOURCES = [
  { id: 'airtable-refresh', label: 'Cache Refresh' },
  { id: 'airtable-backup', label: 'Backups' },
  { id: 'r2-gc', label: 'R2 GC' },
] as const

export type OpsLogSource = typeof OPS_LOG_SOURCES[number]
export type OpsLogSourceId = OpsLogSource['id']
export type WorkflowRunStatus = 'failure' | 'running' | 'skipped' | 'success' | 'warning'

export interface WorkflowRunSummary {
  schemaVersion: 1
  sourceId: OpsLogSourceId
  sourceLabel: string
  runId: string
  date: string
  key: string
  detailKey: string
  detailKeys?: string[]
  status: WorkflowRunStatus
  title: string
  summary: string
  startedAt: number
  endedAt: number
  durationMs: number
  tableNames: string[]
  requestedTables?: string[]
  dueTables?: string[]
  guardOwner?: string
  recordCount?: number
  createdCount?: number
  changedCount?: number
  removedCount?: number
  updatedCount?: number
  sizeBytes?: number
  affectedCount?: number
  deletedCount?: number
  scannedBytes?: number
  deletedBytes?: number
  deleteFailureCount?: number
  logCount: number
  reason?: string
  bucket?: string
  prefix?: string
  scannedCount?: number
  liveCount?: number
  newOrphanCount?: number
  confirmedOrphanCount?: number
  recoveredOrphanCount?: number
  prunedOrphanCount?: number
  missingTables?: string[]
  capped?: boolean
}

export interface WorkflowRunDetail {
  schemaVersion: 1
  summary: WorkflowRunSummary
  events: CacheLogEvent[]
}
