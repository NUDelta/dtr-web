import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { R2_GC_ORPHAN_GRACE_DAYS } from '@/constants/r2'
import { getCicdSecret } from '@/constants/secrets'
import { maybeRunR2CleanupFromISR } from '@/lib/r2/r2-gc'

export async function POST(req: Request) {
  const h = await headers()
  const tokenFromHeader = h.get('x-cron-token') ?? ''
  const secret = getCicdSecret()
  if (secret === undefined) {
    return NextResponse.json({ ok: false, error: 'cron secret is not configured' }, { status: 500 })
  }
  if (tokenFromHeader !== secret) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({})) as unknown
  const {
    prefix = 'images/',
    graceDays = R2_GC_ORPHAN_GRACE_DAYS,
    minIntervalHours = 24,
    maxDeletePerRun = 250,
  } = body as Partial<{
    prefix: string
    graceDays: number
    minIntervalHours: number
    maxDeletePerRun: number
  }>

  const result = await maybeRunR2CleanupFromISR({
    prefix,
    graceDays,
    minIntervalHours,
    maxDeletePerRun,
  })

  return NextResponse.json({ ok: true, ...result })
}
