import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getCicdSecret, isEqualSecret } from '@/constants/secrets'
import { refreshAirtableRecordsCache } from '@/lib/airtable/refresh'

interface AirtableRefreshRequestBody {
  tables?: string[]
  minIntervalHours?: number
  force?: boolean
  guardOwner?: unknown
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

function parseNonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

export async function POST(req: Request) {
  const requestId = randomUUID()
  const startedAt = Date.now()
  const tokenFromHeader = req.headers.get('x-cron-token') ?? ''
  const secret = getCicdSecret()

  if (secret === undefined || secret.length === 0) {
    return NextResponse.json({
      ok: false,
      requestId,
      error: 'refresh secret is not configured',
    }, { status: 500 })
  }

  if (!isEqualSecret(tokenFromHeader, secret)) {
    return NextResponse.json({ ok: false, requestId, error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({})) as AirtableRefreshRequestBody
  const tables = Array.isArray(body.tables) ? body.tables : undefined
  const minIntervalHours = parsePositiveNumber(body.minIntervalHours)
  const force = body.force === true
  const guardOwner = parseNonEmptyString(body.guardOwner)

  console.warn('[airtable-refresh] request started', {
    requestId,
    tables,
    minIntervalHours,
    force,
    guardOwner,
  })

  try {
    const result = await refreshAirtableRecordsCache({
      tables,
      minIntervalHours,
      force,
      requestId,
      guardOwner,
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
      guardOwner,
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
