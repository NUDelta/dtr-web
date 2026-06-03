import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getCicdSecret, isEqualSecret } from '@/constants/secrets'
import { backupAirtableTables } from '@/lib/airtable/backup'

interface AirtableBackupRequestBody {
  tables?: string[]
  minIntervalHours?: number
  force?: boolean
  requestId?: string
}

function parsePositiveNumber(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return undefined
  }

  return value
}

function parseRequestId(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export async function POST(req: Request) {
  const fallbackRequestId = randomUUID()
  const startedAt = Date.now()
  const tokenFromHeader = req.headers.get('x-cron-token') ?? ''
  const secret = getCicdSecret()

  if (secret === undefined || secret.length === 0) {
    return NextResponse.json({
      ok: false,
      requestId: fallbackRequestId,
      error: 'backup secret is not configured',
    }, { status: 500 })
  }

  if (!isEqualSecret(tokenFromHeader, secret)) {
    return NextResponse.json({
      ok: false,
      requestId: fallbackRequestId,
      error: 'unauthorized',
    }, { status: 401 })
  }

  const body = await req.json().catch(() => ({})) as AirtableBackupRequestBody
  const requestId = parseRequestId(body.requestId) ?? fallbackRequestId
  const tables = Array.isArray(body.tables) ? body.tables : undefined
  const minIntervalHours = parsePositiveNumber(body.minIntervalHours)
  const force = body.force === true

  console.warn('[airtable-backup] request started', {
    requestId,
    tables,
    minIntervalHours,
    force,
  })

  try {
    const result = await backupAirtableTables({
      tables,
      minIntervalHours,
      force,
      requestId,
    })
    const durationMs = Date.now() - startedAt

    console.warn('[airtable-backup] request completed', {
      requestId,
      durationMs,
      skipped: result.skipped,
      reason: 'reason' in result ? result.reason : undefined,
      backupDate: 'backupDate' in result ? result.backupDate : undefined,
      manifestKey: 'manifestKey' in result ? result.manifestKey : undefined,
    })

    return NextResponse.json({ ok: true, requestId, durationMs, ...result })
  }
  catch (error) {
    const durationMs = Date.now() - startedAt
    const message = getErrorMessage(error)
    const summary = {
      tables,
      minIntervalHours,
      force,
    }

    console.error('[airtable-backup] request failed', {
      requestId,
      durationMs,
      error: message,
      ...summary,
    })

    return NextResponse.json({
      ok: false,
      requestId,
      durationMs,
      error: message,
      summary,
    }, { status: 500 })
  }
}
