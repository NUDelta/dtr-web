import process from 'node:process'
import { NextResponse } from 'next/server'
import { backupAirtableTables } from '@/lib/airtable/backup'

interface AirtableBackupRequestBody {
  tables?: string[]
  minIntervalHours?: number
  force?: boolean
}

function parsePositiveNumber(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return undefined
  }

  return value
}

export async function POST(req: Request) {
  const tokenFromHeader = req.headers.get('x-cron-token') ?? ''
  const secret = process.env.AIRTABLE_BACKUP_SECRET

  if (secret === undefined || secret.length === 0) {
    return NextResponse.json({ ok: false, error: 'backup secret is not configured' }, { status: 500 })
  }

  if (tokenFromHeader !== secret) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({})) as AirtableBackupRequestBody
  try {
    const result = await backupAirtableTables({
      tables: Array.isArray(body.tables) ? body.tables : undefined,
      minIntervalHours: parsePositiveNumber(body.minIntervalHours),
      force: body.force === true,
    })

    return NextResponse.json({ ok: true, ...result })
  }
  catch {
    return NextResponse.json({ ok: false, error: 'backup failed' }, { status: 500 })
  }
}
