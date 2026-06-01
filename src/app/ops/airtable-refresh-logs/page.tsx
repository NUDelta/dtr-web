import type { Metadata } from 'next'
import process from 'node:process'
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

interface PageProps {
  searchParams: Promise<{
    limit?: string
    token?: string
  }>
}

function getRefreshSecret(): string | undefined {
  const refreshSecret = process.env.AIRTABLE_REFRESH_SECRET
  if (refreshSecret !== undefined && refreshSecret.length > 0) {
    return refreshSecret
  }

  const r2Secret = process.env.R2_CRON_SECRET
  return r2Secret !== undefined && r2Secret.length > 0 ? r2Secret : undefined
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
  const secret = getRefreshSecret()
  const token = params.token ?? ''

  if (secret === undefined || token !== secret) {
    return (
      <section className="mx-auto max-w-3xl py-10">
        <h1 className="text-3xl font-bold">Airtable Refresh Logs</h1>
        <p className="mt-4 text-neutral-700">
          Enter the refresh token to view recent Airtable refresh diagnostics.
        </p>
        <form className="mt-6 flex gap-3" method="get">
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
          <input name="token" type="hidden" value={token} />
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
