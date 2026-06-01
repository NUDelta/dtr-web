import process from 'node:process'
import { NextResponse } from 'next/server'
import { backupAirtableTables } from '@/lib/airtable/backup'

interface AirtableBackupRequestBody {
  tables?: string[]
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
  const result = await backupAirtableTables({
    tables: Array.isArray(body.tables) ? body.tables : undefined,
  })

  return NextResponse.json({ ok: true, ...result })
}
