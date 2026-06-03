import type {
  OpsLogSource,
  OpsLogSourceId,
  WorkflowRunDetail,
  WorkflowRunSummary,
} from './workflow-log-types'
import { R2_BACKUP_BUCKET } from '@/constants/r2'
import { r2PutToBucket } from '@/lib/r2'
import { buildWorkflowRunSummary } from './workflow-log-summary'
import {
  OPS_LOG_SOURCES,
} from './workflow-log-types'

const WORKFLOW_LOG_WRITE_TIMEOUT_MS = 5_000

export {
  OPS_LOG_SOURCES,
  WORKFLOW_LOG_PREFIX,
} from './workflow-log-types'

export type {
  OpsLogSource,
  OpsLogSourceId,
  WorkflowRunDetail,
  WorkflowRunStatus,
  WorkflowRunSummary,
} from './workflow-log-types'

interface WorkflowLogRun {
  add: (event: Omit<CacheLogEvent, 'fullKey' | 'runId' | 'timestamp'> & {
    runId?: string
    timestamp?: number
  }) => void
  flush: () => Promise<void>
}

function getSource(sourceId: OpsLogSourceId): OpsLogSource {
  const source = OPS_LOG_SOURCES.find(item => item.id === sourceId)
  if (source === undefined) {
    throw new Error(`Unknown workflow log source: ${sourceId}`)
  }

  return source
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

async function sleep(ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms))
}

function sanitizeEvent(event: CacheLogEvent): CacheLogEvent {
  if (event.error === undefined) {
    return event
  }

  return {
    ...event,
    error: getErrorMessage(event.error),
  }
}

function getSafeEvents(source: OpsLogSource, runId: string, events: CacheLogEvent[]): CacheLogEvent[] {
  const endedAt = Date.now()
  return events.length === 0
    ? [{
      kind: 'refreshRunFailure',
      fullKey: `${source.id}:${runId}`,
      timestamp: endedAt,
      runId,
      reason: 'workflow finished without events',
    } satisfies CacheLogEvent]
    : events
}

async function writeWorkflowRunLog(summary: WorkflowRunSummary, events: CacheLogEvent[]): Promise<void> {
  if (R2_BACKUP_BUCKET.length === 0) {
    return
  }

  const detail: WorkflowRunDetail = {
    schemaVersion: 1,
    summary,
    events,
  }

  await r2PutToBucket(
    R2_BACKUP_BUCKET,
    summary.detailKey,
    JSON.stringify(detail, null, 2),
    'application/json',
    'no-store',
  )
  await r2PutToBucket(
    R2_BACKUP_BUCKET,
    summary.key,
    JSON.stringify(summary, null, 2),
    'application/json',
    'no-store',
  )
}

export function createWorkflowLogRun(
  sourceId: OpsLogSourceId,
  runId: string,
  startedAt = Date.now(),
): WorkflowLogRun {
  const source = getSource(sourceId)
  const events: CacheLogEvent[] = []
  let flushed = false

  return {
    add(event) {
      events.push(sanitizeEvent({
        fullKey: `${sourceId}:${event.kind}:${runId}`,
        timestamp: event.timestamp ?? Date.now(),
        ...event,
        runId,
      }))
    },
    async flush() {
      if (flushed) {
        return
      }

      flushed = true
      const safeEvents = getSafeEvents(source, runId, events)
      const summary = buildWorkflowRunSummary(source, runId, startedAt, safeEvents)

      try {
        await Promise.race([
          writeWorkflowRunLog(summary, safeEvents),
          sleep(WORKFLOW_LOG_WRITE_TIMEOUT_MS),
        ])
      }
      catch {
        // Remote diagnostics must never fail a workflow's primary work.
      }
    },
  }
}
