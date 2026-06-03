/**
 * Reference-based R2 garbage collector for old image cache objects.
 * - Current Airtable cache records define the live image key set.
 * - KV tracks when an object was first confirmed as orphaned.
 */
import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import {
  R2_BACKUP_BUCKET,
  R2_BUCKET,
  R2_GC_ORPHAN_GRACE_DAYS,
} from '@/constants/r2'
import { cleanupExpiredWorkflowLogs } from '@/lib/audit/workflow-log-retention'
import { createWorkflowLogRun, getErrorMessage } from '@/lib/audit/workflow-logs'
import { r2Delete, r2Get, r2List, r2Put } from '@/lib/r2'
import { collectLiveImageKeys } from '@/lib/r2/r2-gc-live-keys'
import {
  R2_GC_ORPHAN_STATE_KEY,
  readR2GcOrphanState,
  writeR2GcOrphanState,
} from '@/lib/r2/r2-gc-orphan-state'

const STATE_KEY = 'gc/last-run.json'
const PREFIX_DEFAULT = 'images/'

interface GCOptions {
  prefix?: string
  /** How long an object must remain unreferenced before it can be deleted. */
  graceDays?: number
  /** Throttle: only run if last run is older than this many hours. */
  minIntervalHours?: number
  /** Safety cap: maximum number of deletions per run to bound work. */
  maxDeletePerRun?: number
}

interface R2CleanupResult {
  scanned: number
  deleted: number
  capped: boolean
  live: number
  newOrphans: number
  confirmedOrphans: number
  recoveredOrphans: number
  prunedOrphans: number
  missingTables: string[]
  workflowLogsScanned?: number
  workflowLogsDeleted?: number
  skipped?: boolean
  reason?: string
}

function hasR2CleanupChanges(result: R2CleanupResult): boolean {
  return result.deleted > 0
    || result.newOrphans > 0
    || result.confirmedOrphans > 0
    || result.recoveredOrphans > 0
    || result.prunedOrphans > 0
    || result.missingTables.length > 0
    || result.capped
}

function daysSince(tsMs: number) {
  return (Date.now() - tsMs) / (1000 * 60 * 60 * 24)
}

function normalizePrefix(prefix: string | undefined): string {
  return typeof prefix === 'string' && prefix.length > 0 ? prefix : PREFIX_DEFAULT
}

function normalizePositiveNumber(
  value: number | undefined,
  fallback: number,
): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : fallback
}

function normalizePositiveInteger(
  value: number | undefined,
  fallback: number,
): number {
  return Math.floor(normalizePositiveNumber(value, fallback))
}

async function getLastRun(): Promise<Date | null> {
  try {
    const obj = await r2Get(STATE_KEY)
    const text = await obj.Body.transformToString('utf-8')
    const json = JSON.parse(text) as { lastRun: string }
    const dt = new Date(json.lastRun)
    return Number.isNaN(dt.getTime()) ? null : dt
  }
  catch {
    return null
  }
}

async function setLastRun(now = new Date()) {
  const payload = Buffer.from(JSON.stringify({ lastRun: now.toISOString() }), 'utf8')
  await r2Put(STATE_KEY, payload, 'application/json', 'no-store')
}

/**
 * Scan R2 image objects and delete keys that have stayed unreferenced long enough.
 */
export async function runR2CleanupOnce(opts: GCOptions = {}): Promise<R2CleanupResult> {
  const prefix = normalizePrefix(opts.prefix)
  const graceDays = normalizePositiveNumber(opts.graceDays, R2_GC_ORPHAN_GRACE_DAYS)
  const maxDeletePerRun = normalizePositiveInteger(opts.maxDeletePerRun, 250)
  const now = Date.now()
  const { liveKeys, missingTables } = await collectLiveImageKeys()

  if (missingTables.length > 0) {
    return {
      scanned: 0,
      deleted: 0,
      capped: false,
      live: liveKeys.size,
      newOrphans: 0,
      confirmedOrphans: 0,
      recoveredOrphans: 0,
      prunedOrphans: 0,
      missingTables,
      skipped: true,
      reason: `missing Airtable cache tables: ${missingTables.join(', ')}`,
    }
  }

  const orphanState = await readR2GcOrphanState()
  const seenObjectKeys = new Set<string>()
  let token: string | undefined
  let scanned = 0
  let deleted = 0
  let newOrphans = 0
  let confirmedOrphans = 0
  let recoveredOrphans = 0
  let prunedOrphans = 0
  let capped = false

  do {
    const page = await r2List(prefix, token)
    token = page.NextContinuationToken

    for (const obj of page.Contents || []) {
      if (obj.Key === undefined) {
        continue
      }

      const key = obj.Key
      seenObjectKeys.add(key)
      scanned++

      if (liveKeys.has(key)) {
        if (orphanState.orphans[key] !== undefined) {
          delete orphanState.orphans[key]
          recoveredOrphans++
        }
        continue
      }

      const existing = orphanState.orphans[key]
      const firstSeenAt = existing?.firstSeenAt ?? now
      if (existing === undefined) {
        newOrphans++
      }
      else {
        confirmedOrphans++
      }

      orphanState.orphans[key] = {
        firstSeenAt,
        lastSeenAt: now,
        ...(obj.Size !== undefined ? { size: obj.Size } : {}),
      }

      if (daysSince(firstSeenAt) < graceDays) {
        continue
      }

      try {
        await r2Delete(key)
        delete orphanState.orphans[key]
        deleted++
        if (deleted >= maxDeletePerRun) {
          capped = true
          break
        }
      }
      catch {
        // Keep the orphan state so a future run can retry the delete.
      }
    }
  } while (token !== undefined && !capped)

  if (!capped) {
    for (const key of Object.keys(orphanState.orphans)) {
      if (!key.startsWith(prefix)) {
        continue
      }

      if (!seenObjectKeys.has(key) || liveKeys.has(key)) {
        delete orphanState.orphans[key]
        prunedOrphans++
      }
    }
  }

  await writeR2GcOrphanState(orphanState)

  return {
    scanned,
    deleted,
    capped,
    live: liveKeys.size,
    newOrphans,
    confirmedOrphans,
    recoveredOrphans,
    prunedOrphans,
    missingTables,
  }
}

/**
 * Throttled entrypoint for scheduled maintenance.
 * - Only runs if the last run is older than `minIntervalHours` (defaults to 24h).
 * - Writes STATE_KEY after successful scan completion.
 */
export async function maybeRunR2CleanupFromISR(opts: GCOptions = {}) {
  const runStartedAt = Date.now()
  const runId = randomUUID()
  const workflowLog = createWorkflowLogRun('r2-gc', runId, runStartedAt)
  const prefix = normalizePrefix(opts.prefix)
  const graceDays = normalizePositiveNumber(opts.graceDays, R2_GC_ORPHAN_GRACE_DAYS)
  const maxDeletePerRun = normalizePositiveInteger(opts.maxDeletePerRun, 250)
  const minIntervalHours = normalizePositiveNumber(opts.minIntervalHours, 24)

  workflowLog.add({
    kind: 'r2GcRunStart',
    bucket: R2_BUCKET,
    prefix,
    minIntervalHours,
    graceDays,
    maxDeletePerRun,
  })

  const last = await getLastRun()
  if (last !== null) {
    const minutes = (Date.now() - last.getTime()) / (1000 * 60)
    // Skip if last run is within the interval (with 5min buffer).
    if (minutes < (minIntervalHours * 60) - 5) {
      const reason = `last run ${(minutes / 60).toFixed(1)}h ago`
      workflowLog.add({
        kind: 'r2GcRunSkipped',
        bucket: R2_BUCKET,
        prefix,
        reason,
        durationMs: Date.now() - runStartedAt,
      })
      await workflowLog.flush()
      return { skipped: true, reason }
    }
  }

  try {
    const res = await runR2CleanupOnce({
      prefix,
      graceDays,
      maxDeletePerRun,
    })
    if (res.skipped !== true) {
      await setLastRun(new Date())
    }
    const workflowLogRetention = await cleanupExpiredWorkflowLogs().catch((error: unknown) => {
      workflowLog.add({
        kind: 'workflowLogRetention',
        bucket: R2_BACKUP_BUCKET,
        durationMs: Date.now() - runStartedAt,
        reason: getErrorMessage(error),
        error,
      })
      return undefined
    })
    if (workflowLogRetention !== undefined) {
      workflowLog.add({
        kind: 'workflowLogRetention',
        bucket: R2_BACKUP_BUCKET,
        scannedCount: workflowLogRetention.scanned,
        deletedCount: workflowLogRetention.deleted,
        durationMs: Date.now() - runStartedAt,
        affectedCount: workflowLogRetention.deleted,
        capped: workflowLogRetention.capped,
      })
    }
    workflowLog.add({
      kind: 'r2GcOrphanState',
      key: R2_GC_ORPHAN_STATE_KEY,
      prefix,
      bucket: R2_BUCKET,
      liveCount: res.live,
      scannedCount: res.scanned,
      deletedCount: res.deleted,
      newOrphanCount: res.newOrphans,
      confirmedOrphanCount: res.confirmedOrphans,
      recoveredOrphanCount: res.recoveredOrphans,
      prunedOrphanCount: res.prunedOrphans,
      graceDays,
      maxDeletePerRun,
      capped: res.capped,
    })
    workflowLog.add({
      kind: 'r2GcRunSuccess',
      bucket: R2_BUCKET,
      prefix,
      durationMs: Date.now() - runStartedAt,
      scannedCount: res.scanned,
      deletedCount: res.deleted,
      liveCount: res.live,
      newOrphanCount: res.newOrphans,
      confirmedOrphanCount: res.confirmedOrphans,
      recoveredOrphanCount: res.recoveredOrphans,
      prunedOrphanCount: res.prunedOrphans,
      graceDays,
      missingTables: res.missingTables,
      capped: res.capped,
      reason: res.reason ?? (hasR2CleanupChanges(res) ? undefined : 'no R2 cleanup changes detected'),
    })
    await workflowLog.flush()
    return {
      skipped: false,
      ...res,
      workflowLogsScanned: workflowLogRetention?.scanned,
      workflowLogsDeleted: workflowLogRetention?.deleted,
    }
  }
  catch (error) {
    workflowLog.add({
      kind: 'r2GcRunFailure',
      bucket: R2_BUCKET,
      prefix,
      durationMs: Date.now() - runStartedAt,
      reason: getErrorMessage(error),
      error,
    })
    await workflowLog.flush()
    throw error
  }
}
