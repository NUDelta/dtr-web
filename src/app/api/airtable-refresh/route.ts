import process from 'node:process'
import { NextResponse } from 'next/server'
import { refreshAirtableRecordsCache } from '@/lib/airtable/refresh'

interface AirtableRefreshRequestBody {
  tables?: string[]
  minIntervalHours?: number
  force?: boolean
}

function getRefreshSecret(): string | undefined {
  return process.env.AIRTABLE_REFRESH_SECRET ?? process.env.R2_CRON_SECRET
}

function parsePositiveNumber(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return undefined
  }

  return value
}

export async function POST(req: Request) {
  const tokenFromHeader = req.headers.get('x-cron-token') ?? ''
  const tokenFromQuery = new URL(req.url).searchParams.get('token') ?? ''
  const token = tokenFromHeader || tokenFromQuery
  const secret = getRefreshSecret()

  if (secret === undefined || secret.length === 0) {
    return NextResponse.json({ ok: false, error: 'refresh secret is not configured' }, { status: 500 })
  }

  if (token !== secret) {
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
