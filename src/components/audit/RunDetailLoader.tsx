import type { AuditFilters, AuditRun } from './types'
import type { WorkflowRunSummary } from '@/lib/audit/workflow-logs'
import { readWorkflowRunDetails } from '@/lib/audit/workflow-log-reader'
import { mergeWorkflowRunDetails } from '@/lib/audit/workflow-run-grouping'
import RunDetail from './RunDetail'

interface RunDetailLoaderProps {
  filters: AuditFilters
  run?: WorkflowRunSummary
}

async function loadRunDetail(run: WorkflowRunSummary | undefined): Promise<AuditRun | undefined> {
  if (run === undefined) {
    return undefined
  }

  const detailKeys = run.detailKeys ?? [run.detailKey]
  const details = await readWorkflowRunDetails(detailKeys)
  const detail = mergeWorkflowRunDetails(run, details)

  return {
    ...run,
    ...(detail === undefined ? {} : { detail }),
  }
}

export default async function RunDetailLoader({
  filters,
  run,
}: RunDetailLoaderProps) {
  return <RunDetail filters={filters} run={await loadRunDetail(run)} />
}
