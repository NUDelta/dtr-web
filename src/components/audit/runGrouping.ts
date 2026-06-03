import type { AuditRun } from './types'
import type {
  WorkflowRunDetail,
  WorkflowRunSummary,
} from '@/lib/audit/workflow-logs'

export function getSelectedRun(
  runs: AuditRun[],
  selectedKey: string | undefined,
): AuditRun | undefined {
  return runs.length === 0
    ? undefined
    : runs.find(run => run.detailKey === selectedKey || run.key === selectedKey) ?? runs[0]
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
