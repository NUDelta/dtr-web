import type { AuditRun } from './types'
import type {
  WorkflowRunDetail,
  WorkflowRunSummary,
} from '@/lib/audit/workflow-logs'

export function getSelectedRun(
  runs: AuditRun[],
  selectedKey: string | undefined,
): AuditRun | undefined {
  if (selectedKey === undefined) {
    return undefined
  }

  return runs.find(run => run.detailKey === selectedKey || run.key === selectedKey)
}

export function attachSelectedDetail(
  summaries: WorkflowRunSummary[],
  selectedDetail: WorkflowRunDetail | undefined,
): AuditRun[] {
  return summaries.map(summary => ({
    ...summary,
    ...(selectedDetail?.summary.detailKey === summary.detailKey ? { detail: selectedDetail } : {}),
  }))
}
