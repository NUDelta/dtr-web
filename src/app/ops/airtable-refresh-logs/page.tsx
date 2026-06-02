import type { Metadata } from 'next'
import { Buffer } from 'node:buffer'
import { createHmac, timingSafeEqual } from 'node:crypto'
import process from 'node:process'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { readRecentAirtableRefreshLogs } from '@/lib/airtable/refresh-log-reader'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Airtable Refresh Logs | DTR Ops',
  robots: {
    index: false,
    follow: false,
  },
}

const REFRESH_LOGS_AUTH_COOKIE = 'airtable_refresh_logs_auth'
const REFRESH_LOGS_AUTH_MAX_AGE_SECONDS = 60 * 60 * 6

interface PageProps {
  searchParams: Promise<{
    auth?: string
    limit?: string
  }>
}

function getRefreshLogsSecret(): string | undefined {
  const refreshSecret = process.env.AIRTABLE_REFRESH_SECRET
  if (refreshSecret !== undefined && refreshSecret.length > 0) {
    return refreshSecret
  }

  const r2Secret = process.env.R2_CRON_SECRET
  return r2Secret !== undefined && r2Secret.length > 0 ? r2Secret : undefined
}

function getRefreshLogsSessionValue(secret: string): string {
  return createHmac('sha256', secret)
    .update('airtable-refresh-logs')
    .digest('hex')
}

function isEqualSecret(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual)
  const expectedBuffer = Buffer.from(expected)

  return (
    actualBuffer.byteLength === expectedBuffer.byteLength
    && timingSafeEqual(actualBuffer, expectedBuffer)
  )
}

async function authenticateAirtableRefreshLogs(formData: FormData) {
  'use server'

  const secret = getRefreshLogsSecret()
  const token = formData.get('token')

  if (
    secret === undefined
    || typeof token !== 'string'
    || !isEqualSecret(token, secret)
  ) {
    redirect('/ops/airtable-refresh-logs?auth=failed')
  }

  const cookieStore = await cookies()
  cookieStore.set(
    REFRESH_LOGS_AUTH_COOKIE,
    getRefreshLogsSessionValue(secret),
    {
      httpOnly: true,
      maxAge: REFRESH_LOGS_AUTH_MAX_AGE_SECONDS,
      path: '/ops/airtable-refresh-logs',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    },
  )

  redirect('/ops/airtable-refresh-logs')
}

function parseLimit(value: string | undefined): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) {
    return 100
  }

  return Math.min(parsed, 200)
}

function formatTimestamp(timestamp: number | undefined): string {
  if (timestamp === undefined || !Number.isFinite(timestamp)) {
    return '-'
  }

  return new Date(timestamp).toISOString()
}

function formatDuration(durationMs: number | undefined): string {
  if (durationMs === undefined || !Number.isFinite(durationMs)) {
    return '-'
  }

  if (durationMs < 1000) {
    return `${durationMs}ms`
  }

  return `${(durationMs / 1000).toFixed(1)}s`
}

export default async function AirtableRefreshLogsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const secret = getRefreshLogsSecret()
  const cookieStore = await cookies()
  const session = cookieStore.get(REFRESH_LOGS_AUTH_COOKIE)?.value ?? ''
  const isAuthenticated = secret !== undefined
    && isEqualSecret(session, getRefreshLogsSessionValue(secret))

  if (!isAuthenticated) {
    return (
      <section className="mx-auto max-w-3xl py-10">
        <h1 className="text-3xl font-bold">Airtable Refresh Logs</h1>
        <p className="mt-4 text-neutral-700">
          Enter the refresh token to view recent Airtable refresh diagnostics.
        </p>
        {params.auth === 'failed' && (
          <p className="mt-3 text-sm font-medium text-red-700">
            Invalid refresh log token.
          </p>
        )}
        <form action={authenticateAirtableRefreshLogs} className="mt-6 flex gap-3">
          <input
            className="min-w-0 flex-1 rounded border border-neutral-300 px-3 py-2"
            name="token"
            placeholder="AIRTABLE_REFRESH_SECRET"
            type="password"
          />
          <button className="rounded bg-black px-4 py-2 text-white" type="submit">
            View
          </button>
        </form>
      </section>
    )
  }

  const limit = parseLimit(params.limit)
  const logs = await readRecentAirtableRefreshLogs(limit)

  return (
    <section className="py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Airtable Refresh Logs</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Recent KV-backed refresh diagnostics. Logs are retained for 180 days.
          </p>
        </div>
        <form className="flex items-center gap-2" method="get">
          <label className="text-sm text-neutral-600" htmlFor="limit">Limit</label>
          <input
            className="w-24 rounded border border-neutral-300 px-2 py-1"
            defaultValue={limit}
            id="limit"
            max={200}
            min={1}
            name="limit"
            type="number"
          />
          <button className="rounded bg-black px-3 py-1.5 text-sm text-white" type="submit">
            Refresh
          </button>
        </form>
      </div>

      <div className="overflow-x-auto border border-neutral-200">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-neutral-100">
            <tr>
              <th className="border-b border-neutral-200 px-3 py-2">Time</th>
              <th className="border-b border-neutral-200 px-3 py-2">Kind</th>
              <th className="border-b border-neutral-200 px-3 py-2">Run</th>
              <th className="border-b border-neutral-200 px-3 py-2">Table</th>
              <th className="border-b border-neutral-200 px-3 py-2">Duration</th>
              <th className="border-b border-neutral-200 px-3 py-2">Records</th>
              <th className="border-b border-neutral-200 px-3 py-2">Reason</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(({ key, event }) => (
              <tr className="align-top odd:bg-white even:bg-neutral-50" key={key}>
                <td className="border-b border-neutral-200 px-3 py-2 font-mono text-xs">
                  {formatTimestamp(event.timestamp)}
                </td>
                <td className="border-b border-neutral-200 px-3 py-2 font-medium">
                  {event.kind}
                </td>
                <td className="max-w-48 truncate border-b border-neutral-200 px-3 py-2 font-mono text-xs">
                  {event.runId ?? '-'}
                </td>
                <td className="border-b border-neutral-200 px-3 py-2">
                  {event.table ?? '-'}
                </td>
                <td className="border-b border-neutral-200 px-3 py-2">
                  {formatDuration(event.durationMs)}
                </td>
                <td className="border-b border-neutral-200 px-3 py-2">
                  {event.recordCount ?? event.affectedCount ?? '-'}
                </td>
                <td className="max-w-xl border-b border-neutral-200 px-3 py-2">
                  {event.reason ?? '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className="mt-6">
        <summary className="cursor-pointer font-medium">Raw latest event</summary>
        <pre className="mt-3 overflow-auto rounded bg-neutral-100 p-4 text-xs">
          {JSON.stringify(logs[0]?.event ?? null, null, 2)}
        </pre>
      </details>
    </section>
  )
}
