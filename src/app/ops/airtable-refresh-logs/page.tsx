import type { Metadata } from 'next'
import type { OpsLogSourceId } from '@/lib/ops/logging'
import { Buffer } from 'node:buffer'
import { createHmac, timingSafeEqual } from 'node:crypto'
import process from 'node:process'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Script from 'next/script'
import { TURNSTILE_SITE_KEY } from '@/constants/cloudflare'
import { getOpsSecret } from '@/constants/secrets'
import {
  readRecentArchivedLogManifests,
  readRecentOpsLogs,
} from '@/lib/ops/audit-logs'
import { OPS_LOG_SOURCES } from '@/lib/ops/logging'
import { verifyTurnstileToken } from '@/lib/turnstile'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Ops Audit Logs | DTR Ops',
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
    source?: string
  }>
}

function getRefreshLogsSecret(): string | undefined {
  return getOpsSecret()
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
  const turnstileToken = formData.get('cf-turnstile-response')

  const turnstile = await verifyTurnstileToken(
    typeof turnstileToken === 'string' ? turnstileToken : undefined,
  )

  if (!turnstile.success) {
    redirect('/ops/airtable-refresh-logs?auth=challenge')
  }

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

function parseSource(value: string | undefined): OpsLogSourceId | 'all' {
  if (value === undefined || value === 'all') {
    return 'all'
  }

  const match = OPS_LOG_SOURCES.find(source => source.id === value)
  return match?.id ?? 'all'
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
        <h1 className="text-3xl font-bold">Ops Audit Logs</h1>
        <p className="mt-4 text-neutral-700">
          Enter the ops token to view recent maintenance diagnostics.
        </p>
        {params.auth === 'failed' && (
          <p className="mt-3 text-sm font-medium text-red-700">
            Invalid refresh log token.
          </p>
        )}
        {params.auth === 'challenge' && (
          <p className="mt-3 text-sm font-medium text-red-700">
            Complete the verification challenge.
          </p>
        )}
        <Script
          async
          defer
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
        <form action={authenticateAirtableRefreshLogs} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start">
          <input
            className="min-w-0 flex-1 rounded border border-neutral-300 px-3 py-2"
            name="token"
            placeholder="OPS_SECRET"
            type="password"
          />
          <div
            className="cf-turnstile"
            data-action="ops-audit-login"
            data-sitekey={TURNSTILE_SITE_KEY}
          />
          <button className="rounded bg-black px-4 py-2 text-white" type="submit">
            View
          </button>
        </form>
      </section>
    )
  }

  const limit = parseLimit(params.limit)
  const source = parseSource(params.source)
  const [logs, archivedManifests] = await Promise.all([
    readRecentOpsLogs({ limit, sourceId: source }),
    readRecentArchivedLogManifests(10),
  ])

  return (
    <section className="py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Ops Audit Logs</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Recent KV-backed maintenance diagnostics plus backup-bucket log snapshots.
          </p>
        </div>
        <form className="flex flex-wrap items-center gap-2" method="get">
          <label className="text-sm text-neutral-600" htmlFor="source">Source</label>
          <select
            className="rounded border border-neutral-300 px-2 py-1"
            defaultValue={source}
            id="source"
            name="source"
          >
            <option value="all">All</option>
            {OPS_LOG_SOURCES.map(item => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
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
              <th className="border-b border-neutral-200 px-3 py-2">Source</th>
              <th className="border-b border-neutral-200 px-3 py-2">Kind</th>
              <th className="border-b border-neutral-200 px-3 py-2">Run</th>
              <th className="border-b border-neutral-200 px-3 py-2">Table</th>
              <th className="border-b border-neutral-200 px-3 py-2">Duration</th>
              <th className="border-b border-neutral-200 px-3 py-2">Records</th>
              <th className="border-b border-neutral-200 px-3 py-2">Reason</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(({ key, event, sourceLabel }) => (
              <tr className="align-top odd:bg-white even:bg-neutral-50" key={key}>
                <td className="border-b border-neutral-200 px-3 py-2 font-mono text-xs">
                  {formatTimestamp(event.timestamp)}
                </td>
                <td className="border-b border-neutral-200 px-3 py-2">
                  {sourceLabel}
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
                  {event.recordCount ?? event.affectedCount ?? event.logCount ?? '-'}
                </td>
                <td className="max-w-xl border-b border-neutral-200 px-3 py-2">
                  {event.reason ?? '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-bold">Archived Snapshots</h2>
        <div className="mt-3 overflow-x-auto border border-neutral-200">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-neutral-100">
              <tr>
                <th className="border-b border-neutral-200 px-3 py-2">Backup Date</th>
                <th className="border-b border-neutral-200 px-3 py-2">Backed Up At</th>
                <th className="border-b border-neutral-200 px-3 py-2">Manifest</th>
                <th className="border-b border-neutral-200 px-3 py-2">Sources</th>
              </tr>
            </thead>
            <tbody>
              {archivedManifests.map(manifest => (
                <tr className="align-top odd:bg-white even:bg-neutral-50" key={manifest.key}>
                  <td className="border-b border-neutral-200 px-3 py-2">
                    {manifest.backupDate ?? '-'}
                  </td>
                  <td className="border-b border-neutral-200 px-3 py-2 font-mono text-xs">
                    {manifest.backedUpAt ?? '-'}
                  </td>
                  <td className="max-w-sm break-all border-b border-neutral-200 px-3 py-2 font-mono text-xs">
                    {manifest.key}
                  </td>
                  <td className="border-b border-neutral-200 px-3 py-2">
                    {manifest.sources.map(item => `${item.sourceLabel}: ${item.logs}`).join(', ')}
                  </td>
                </tr>
              ))}
              {archivedManifests.length === 0 && (
                <tr>
                  <td className="border-b border-neutral-200 px-3 py-3 text-neutral-600" colSpan={4}>
                    No archived log snapshots found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <details className="mt-6">
        <summary className="cursor-pointer font-medium">Raw latest event</summary>
        <pre className="mt-3 overflow-auto rounded bg-neutral-100 p-4 text-xs">
          {JSON.stringify(logs[0]?.event ?? null, null, 2)}
        </pre>
      </details>
    </section>
  )
}
