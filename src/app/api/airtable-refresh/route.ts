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

export async function POST(req: Request) {
  const tokenFromHeader = req.headers.get('x-cron-token') ?? ''
  const secret = getRefreshSecret()

  if (secret === undefined || secret.length === 0) {
    return NextResponse.json({ ok: false, error: 'refresh secret is not configured' }, { status: 500 })
  }

  if (tokenFromHeader !== secret) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({})) as AirtableRefreshRequestBody
  const result = await refreshAirtableRecordsCache({
    tables: Array.isArray(body.tables) ? body.tables : undefined,
    minIntervalHours: parsePositiveNumber(body.minIntervalHours),
    force: body.force === true,
  })

  return NextResponse.json({ ok: true, ...result })
}
