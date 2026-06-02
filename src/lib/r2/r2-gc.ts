/**
 * R2 garbage collector for old image cache objects.
 * - A throttle ("run at most every X hours") prevents frequent scans in ISR.
 */
import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import { R2_BUCKET } from '@/lib/consts'
import { getErrorMessage, logOpsEvent } from '@/lib/ops/logging'
import { r2Delete, r2Get, r2List, r2Put } from '@/lib/r2'

const STATE_KEY = 'gc/last-run.json' // stores {"lastRun":"2025-10-20T00:00:00.000Z"}
const PREFIX_DEFAULT = 'images/'

interface GCOptions {
  prefix?: string
  /** Delete objects older than this many days since last access */
  maxAgeDays?: number
  /** Throttle: only run if last run is older than this many hours */
  minIntervalHours?: number
  /** Safety cap: maximum number of deletions per run to bound work */
  maxDeletePerRun?: number
}

function daysSince(tsMs: number) {
  return (Date.now() - tsMs) / (1000 * 60 * 60 * 24)
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
 * Scan and delete old objects under `prefix`.
 * Returns summary counts for observability.
 */
export async function runR2CleanupOnce(opts: GCOptions = {}) {
  const prefix = opts.prefix ?? PREFIX_DEFAULT
  const maxAgeDays = opts.maxAgeDays ?? 45
  const maxDeletePerRun = opts.maxDeletePerRun ?? 250

  let token: string | undefined
  let scanned = 0
  let deleted = 0

  do {
    const page = await r2List(prefix, token)
    token = page.NextContinuationToken

    for (const obj of page.Contents || []) {
      if (obj.Key === undefined) {
        continue
      }
      scanned++

      if (obj.LastModified === undefined) {
        continue
      }

      const age = daysSince(obj.LastModified.getTime())
      if (age > maxAgeDays) {
        try {
          await r2Delete(obj.Key)
          deleted++
          if (deleted >= maxDeletePerRun) {
            return { scanned, deleted, capped: true }
          }
        }
        catch {
          // ignore delete failure; proceed
        }
      }
    }
  } while (token !== undefined)

  return { scanned, deleted, capped: false }
}

/**
 * Throttled entrypoint for ISR hooks.
 * - Only runs if the last run is older than `minIntervalHours` (defaults to 24h).
 * - Writes STATE_KEY before the scan to reduce concurrent duplications.
 */
export async function maybeRunR2CleanupFromISR(opts: GCOptions = {}) {
  const runStartedAt = Date.now()
  const runId = randomUUID()
  const prefix = opts.prefix ?? PREFIX_DEFAULT
  const maxAgeDays = opts.maxAgeDays ?? 45
  const maxDeletePerRun = opts.maxDeletePerRun ?? 250
  const minIntervalHours = opts.minIntervalHours ?? 24

  await logOpsEvent('r2-gc', {
    kind: 'r2GcRunStart',
    runId,
    bucket: R2_BUCKET,
    prefix,
    minIntervalHours,
    maxAgeDays,
    maxDeletePerRun,
  })

  const last = await getLastRun()
  if (last !== null) {
    const minutes = (Date.now() - last.getTime()) / (1000 * 60)
    // Skip if last run is within the interval (with 5min buffer).
    if (minutes < (minIntervalHours * 60) - 5) {
      const reason = `last run ${(minutes / 60).toFixed(1)}h ago`
      await logOpsEvent('r2-gc', {
        kind: 'r2GcRunSuccess',
        runId,
        bucket: R2_BUCKET,
        prefix,
        reason,
        durationMs: Date.now() - runStartedAt,
      })
      return { skipped: true, reason }
    }
  }

  try {
    const res = await runR2CleanupOnce(opts)
    await setLastRun(new Date())
    await logOpsEvent('r2-gc', {
      kind: 'r2GcRunSuccess',
      runId,
      bucket: R2_BUCKET,
      prefix,
      durationMs: Date.now() - runStartedAt,
      scannedCount: res.scanned,
      deletedCount: res.deleted,
      capped: res.capped,
    })
    return { skipped: false, ...res }
  }
  catch (error) {
    await logOpsEvent('r2-gc', {
      kind: 'r2GcRunFailure',
      runId,
      bucket: R2_BUCKET,
      prefix,
      durationMs: Date.now() - runStartedAt,
      reason: getErrorMessage(error),
      error,
    })
    throw error
  }
}
