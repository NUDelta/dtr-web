import { randomUUID } from 'node:crypto'
import process from 'node:process'
import { NextResponse } from 'next/server'
import { refreshAirtableRecordsCache } from '@/lib/airtable/refresh'

interface AirtableRefreshRequestBody {
  tables?: string[]
  minIntervalHours?: number
  force?: boolean
}

function getRefreshSecret(): string | undefined {
  const refreshSecret = process.env.AIRTABLE_REFRESH_SECRET
  if (refreshSecret !== undefined && refreshSecret.length > 0) {
    return refreshSecret
  }

  const r2Secret = process.env.R2_CRON_SECRET
  return r2Secret !== undefined && r2Secret.length > 0 ? r2Secret : undefined
}

function parsePositiveNumber(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return undefined
  }

  return value
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export async function POST(req: Request) {
  const requestId = randomUUID()
  const startedAt = Date.now()
  const tokenFromHeader = req.headers.get('x-cron-token') ?? ''
  const secret = getRefreshSecret()

  if (secret === undefined || secret.length === 0) {
    return NextResponse.json({
      ok: false,
      requestId,
      error: 'refresh secret is not configured',
    }, { status: 500 })
  }

  if (tokenFromHeader !== secret) {
    return NextResponse.json({ ok: false, requestId, error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({})) as AirtableRefreshRequestBody
  const tables = Array.isArray(body.tables) ? body.tables : undefined
  const minIntervalHours = parsePositiveNumber(body.minIntervalHours)
  const force = body.force === true

  console.warn('[airtable-refresh] request started', {
    requestId,
    tables,
    minIntervalHours,
    force,
  })

  try {
    const result = await refreshAirtableRecordsCache({
      tables,
      minIntervalHours,
      force,
      requestId,
    })

    const durationMs = Date.now() - startedAt
    console.warn('[airtable-refresh] request completed', {
      requestId,
      durationMs,
      skipped: result.skipped,
      refreshed: 'refreshed' in result ? result.refreshed : undefined,
      reason: 'reason' in result ? result.reason : undefined,
    })

    return NextResponse.json({ ok: true, requestId, durationMs, ...result })
  }
  catch (error) {
    const durationMs = Date.now() - startedAt
    const message = getErrorMessage(error)
    console.error('[airtable-refresh] request failed', {
      requestId,
      durationMs,
      tables,
      minIntervalHours,
      force,
      error: message,
    })

    return NextResponse.json({
      ok: false,
      requestId,
      durationMs,
      error: message,
    }, { status: 500 })
  }
}
