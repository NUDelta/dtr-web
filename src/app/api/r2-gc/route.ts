import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { R2_GC_ORPHAN_GRACE_DAYS } from '@/constants/r2'
import { getCicdSecret, isEqualSecret } from '@/constants/secrets'
import { maybeRunR2CleanupFromISR } from '@/lib/r2/r2-gc'

const R2_GC_PREFIX = 'images/'
const R2_GC_MIN_INTERVAL_HOURS = 24
const R2_GC_MAX_DELETE_PER_RUN = 250

interface R2GcRequestBody {
  prefix?: unknown
  graceDays?: unknown
  minIntervalHours?: unknown
  maxDeletePerRun?: unknown
}

function parsePositiveNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : fallback
}

function parseMaxDeletePerRun(value: unknown): number {
  return Math.min(
    Math.floor(parsePositiveNumber(value, R2_GC_MAX_DELETE_PER_RUN)),
    R2_GC_MAX_DELETE_PER_RUN,
  )
}

function parseRequestBody(value: unknown): R2GcRequestBody {
  return typeof value === 'object' && value !== null ? value : {}
}

export async function POST(req: Request) {
  const h = await headers()
  const tokenFromHeader = h.get('x-cron-token') ?? ''
  const secret = getCicdSecret()
  if (secret === undefined) {
    return NextResponse.json({ ok: false, error: 'cron secret is not configured' }, { status: 500 })
  }
  if (!isEqualSecret(tokenFromHeader, secret)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  const body = parseRequestBody(await req.json().catch(() => ({})))
  if (body.prefix !== undefined && body.prefix !== R2_GC_PREFIX) {
    return NextResponse.json({
      ok: false,
      error: 'unsupported cleanup prefix',
      allowedPrefix: R2_GC_PREFIX,
    }, { status: 400 })
  }

  const graceDays = Math.max(
    parsePositiveNumber(body.graceDays, R2_GC_ORPHAN_GRACE_DAYS),
    R2_GC_ORPHAN_GRACE_DAYS,
  )
  const minIntervalHours = Math.max(
    parsePositiveNumber(body.minIntervalHours, R2_GC_MIN_INTERVAL_HOURS),
    R2_GC_MIN_INTERVAL_HOURS,
  )
  const maxDeletePerRun = parseMaxDeletePerRun(body.maxDeletePerRun)

  const result = await maybeRunR2CleanupFromISR({
    prefix: R2_GC_PREFIX,
    graceDays,
    minIntervalHours,
    maxDeletePerRun,
  })

  return NextResponse.json({ ok: true, ...result })
}
