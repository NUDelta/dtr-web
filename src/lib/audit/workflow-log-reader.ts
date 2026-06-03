import type {
  OpsLogSourceId,
  WorkflowRunDetail,
  WorkflowRunSummary,
} from './workflow-logs'
import { R2_BACKUP_BUCKET } from '@/constants/r2'
import { r2GetFromBucket, r2ListFromBucket } from '@/lib/r2'
import { OPS_LOG_SOURCES } from './workflow-logs'

const DEFAULT_SUMMARY_LIMIT = 100
const MAX_SUMMARY_LIMIT = 300
const DEFAULT_LOOKBACK_DAYS = 7
const MAX_LOOKBACK_DAYS = 60
const SUMMARY_PREFIX = 'logs/summaries'

function clampLimit(limit: number): number {
  if (!Number.isInteger(limit) || limit < 1) {
    return DEFAULT_SUMMARY_LIMIT
  }

  return Math.min(limit, MAX_SUMMARY_LIMIT)
}

function clampLookbackDays(days: number): number {
  if (!Number.isInteger(days) || days < 1) {
    return DEFAULT_LOOKBACK_DAYS
  }

  return Math.min(days, MAX_LOOKBACK_DAYS)
}

function getRecentIsoDays(days: number): string[] {
  const result: string[] = []
  const now = new Date()

  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - offset,
    ))
    result.push(date.toISOString().slice(0, 10))
  }

  return result
}

function isWorkflowSourceId(sourceId: string): sourceId is OpsLogSourceId {
  return OPS_LOG_SOURCES.some(source => source.id === sourceId)
}

function isWorkflowRunSummary(value: unknown): value is WorkflowRunSummary {
  const parsed = value as Partial<WorkflowRunSummary>
  return (
    typeof value === 'object'
    && value !== null
    && parsed.schemaVersion === 1
    && typeof parsed.sourceId === 'string'
    && isWorkflowSourceId(parsed.sourceId)
    && typeof parsed.runId === 'string'
    && typeof parsed.key === 'string'
    && typeof parsed.detailKey === 'string'
    && typeof parsed.startedAt === 'number'
    && typeof parsed.endedAt === 'number'
    && typeof parsed.durationMs === 'number'
    && typeof parsed.status === 'string'
    && typeof parsed.title === 'string'
    && typeof parsed.summary === 'string'
    && Array.isArray(parsed.tableNames)
  )
}

function isCacheLogEvent(value: unknown): value is CacheLogEvent {
  const parsed = value as Partial<CacheLogEvent>
  return (
    typeof value === 'object'
    && value !== null
    && typeof parsed.kind === 'string'
    && typeof parsed.fullKey === 'string'
    && typeof parsed.timestamp === 'number'
    && Number.isFinite(parsed.timestamp)
  )
}

function parseWorkflowSummary(value: string): WorkflowRunSummary | undefined {
  try {
    const parsed = JSON.parse(value) as unknown
    return isWorkflowRunSummary(parsed) ? parsed : undefined
  }
  catch {
    return undefined
  }
}

function parseWorkflowDetail(value: string): WorkflowRunDetail | undefined {
  try {
    const parsed = JSON.parse(value) as Partial<WorkflowRunDetail>
    if (
      parsed.schemaVersion !== 1
      || !isWorkflowRunSummary(parsed.summary)
      || !Array.isArray(parsed.events)
    ) {
      return undefined
    }

    return {
      schemaVersion: 1,
      summary: parsed.summary,
      events: parsed.events.filter(isCacheLogEvent),
    }
  }
  catch {
    return undefined
  }
}

async function readR2Text(key: string): Promise<string | undefined> {
  if (R2_BACKUP_BUCKET.length === 0) {
    return undefined
  }

  try {
    const object = await r2GetFromBucket(R2_BACKUP_BUCKET, key)
    return await object.Body.transformToString('utf-8')
  }
  catch {
    return undefined
  }
}

async function listSummaryKeysByPrefix(prefix: string): Promise<string[]> {
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

async function readWorkflowSummary(key: string): Promise<WorkflowRunSummary | undefined> {
  const text = await readR2Text(key)
  return text === undefined ? undefined : parseWorkflowSummary(text)
}

/**
 * Reads lightweight workflow summary objects for the audit page.
 *
 * This intentionally lists bounded date/workflow prefixes only and does not
 * read detail objects; details are loaded lazily after an operator selects a
 * specific run.
 */
export async function readRecentWorkflowRunSummaries(options: {
  days?: number
  limit?: number
  sourceId?: OpsLogSourceId | 'all'
} = {}): Promise<WorkflowRunSummary[]> {
  if (R2_BACKUP_BUCKET.length === 0) {
    return []
  }

  const safeDays = clampLookbackDays(options.days ?? DEFAULT_LOOKBACK_DAYS)
  const safeLimit = clampLimit(options.limit ?? DEFAULT_SUMMARY_LIMIT)
  const sources = options.sourceId === undefined || options.sourceId === 'all'
    ? OPS_LOG_SOURCES
    : OPS_LOG_SOURCES.filter(source => source.id === options.sourceId)
  const prefixes = sources.flatMap(source => (
    getRecentIsoDays(safeDays).map(day => `${SUMMARY_PREFIX}/${source.id}/${day}/`)
  ))
  const keys = (await Promise.all(prefixes.map(listSummaryKeysByPrefix))).flat()
  const summaries = (await Promise.all(keys.map(readWorkflowSummary)))
    .filter((summary): summary is WorkflowRunSummary => summary !== undefined)

  return summaries
    .sort((a, b) => b.endedAt - a.endedAt)
    .slice(0, safeLimit)
}

async function readWorkflowRunDetail(
  detailKey: string | undefined,
): Promise<WorkflowRunDetail | undefined> {
  if (detailKey === undefined || !detailKey.startsWith('logs/details/')) {
    return undefined
  }

  const text = await readR2Text(detailKey)
  return text === undefined ? undefined : parseWorkflowDetail(text)
}

/**
 * Reads one or more detail objects for a selected run.
 *
 * Grouped refresh rows can point at multiple per-table detail objects, while
 * backup and cleanup rows normally point at a single detail object.
 */
export async function readWorkflowRunDetails(
  detailKeys: string[],
): Promise<WorkflowRunDetail[]> {
  const details = await Promise.all(detailKeys.map(readWorkflowRunDetail))
  return details.filter((detail): detail is WorkflowRunDetail => detail !== undefined)
}
