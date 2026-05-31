import process from 'node:process'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { maybeRunR2CleanupFromISR } from '@/lib/r2/r2-gc'

export async function POST(req: Request) {
  const h = await headers()
  const tokenFromHeader = h.get('x-cron-token') ?? ''
  if (process.env.R2_CRON_SECRET === undefined || process.env.R2_CRON_SECRET.length === 0) {
    return NextResponse.json({ ok: false, error: 'cron secret is not configured' }, { status: 500 })
  }
  if (tokenFromHeader !== process.env.R2_CRON_SECRET) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({})) as unknown
  const {
    prefix = 'images/',
    maxAgeDays = 60,
    minIntervalHours = 24,
    maxDeletePerRun = 250,
  } = body as Partial<{
    prefix: string
    maxAgeDays: number
    minIntervalHours: number
    maxDeletePerRun: number
  }>

  const result = await maybeRunR2CleanupFromISR({
    prefix,
    maxAgeDays,
    minIntervalHours,
    maxDeletePerRun,
  })

  return NextResponse.json({ ok: true, ...result })
}
