import type {
  OpsLogSourceId,
  WorkflowRunDetail,
  WorkflowRunStatus,
  WorkflowRunSummary,
} from '@/lib/audit/workflow-logs'

export type RunStatus = WorkflowRunStatus
export type TimeRange = '7d' | '30d' | '60d'

export interface AuditFilters {
  q: string
  page: number
  source: OpsLogSourceId | 'all'
  status: RunStatus | 'all'
  table: string
  range: TimeRange
}

export interface AuditConsoleProps {
  filters: AuditFilters
  selectedKey?: string
  summaries: WorkflowRunSummary[]
}

export interface AuditRun extends WorkflowRunSummary {
  detail?: WorkflowRunDetail
}
