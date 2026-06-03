import { R2_BACKUP_BUCKET } from '@/constants/r2'
import {
  r2DeleteFromBucket,
  r2ListFromBucket,
} from '@/lib/r2'
import {
  OPS_LOG_SOURCES,
  WORKFLOW_LOG_PREFIX,
  WORKFLOW_LOG_RETENTION_DAYS,
} from './workflow-log-types'

const LOG_KINDS = ['summaries', 'details'] as const
const MAX_DELETE_PER_RUN = 500

interface WorkflowLogRetentionResult {
  scanned: number
  deleted: number
  retentionDays: number
  capped: boolean
}

function getCutoffDate(retentionDays: number): string {
  const now = new Date()
  const cutoff = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - retentionDays,
  ))
  return cutoff.toISOString().slice(0, 10)
}

function getDateFromWorkflowLogKey(key: string): string | undefined {
  const match = /^logs\/(?:summaries|details)\/[^/]+\/(\d{4}-\d{2}-\d{2})\//.exec(key)
  return match?.[1]
}

async function listWorkflowLogKeys(prefix: string): Promise<string[]> {
  const keys: string[] = []
  let token: string | undefined

  do {
    const page = await r2ListFromBucket(R2_BACKUP_BUCKET, prefix, token)
    keys.push(...(page.Contents ?? [])
      .map(object => object.Key)
      .filter((key): key is string => typeof key === 'string' && key.endsWith('.json')))
    token = page.NextContinuationToken
  } while (token !== undefined)

  return keys
}

/**
 * Deletes expired audit summary/detail objects from the backup R2 bucket.
 *
 * The cleanup scans known workflow prefixes and caps deletes per run so log
 * retention cannot turn into an unbounded maintenance job.
 */
export async function cleanupExpiredWorkflowLogs(
  retentionDays = WORKFLOW_LOG_RETENTION_DAYS,
): Promise<WorkflowLogRetentionResult> {
  if (R2_BACKUP_BUCKET.length === 0) {
    return { scanned: 0, deleted: 0, retentionDays, capped: false }
  }

  const cutoffDate = getCutoffDate(retentionDays)
  const prefixes = OPS_LOG_SOURCES.flatMap(source => (
    LOG_KINDS.map(kind => `${WORKFLOW_LOG_PREFIX}/${kind}/${source.id}/`)
  ))
  const keys = (await Promise.all(prefixes.map(listWorkflowLogKeys))).flat()
  const expiredKeys = keys.filter((key) => {
    const date = getDateFromWorkflowLogKey(key)
    return date !== undefined && date < cutoffDate
  })

  let deleted = 0
  let capped = false
  for (const key of expiredKeys) {
    try {
      await r2DeleteFromBucket(R2_BACKUP_BUCKET, key)
      deleted += 1
      if (deleted >= MAX_DELETE_PER_RUN) {
        capped = true
        break
      }
    }
    catch {
      // A later cleanup run can retry failed deletes.
    }
  }

  return {
    scanned: keys.length,
    deleted,
    retentionDays,
    capped,
  }
}
