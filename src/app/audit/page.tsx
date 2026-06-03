import type { Metadata } from 'next'
import type { OpsLogSourceId } from '@/lib/audit/workflow-logs'
import Script from 'next/script'
import { authenticateAudit } from '@/app/audit/actions'
import AuditConsole from '@/components/audit/AuditConsole'
import AuditSessionRefresher from '@/components/audit/AuditSessionRefresher'
import { TURNSTILE_SITE_KEY } from '@/constants/cloudflare'
import { getOpsSecret } from '@/constants/secrets'
import {
  readAuditSession,
  shouldRefreshAuditSession,
} from '@/lib/audit/session'
import {
  readRecentWorkflowRunSummaries,
  readWorkflowRunDetail,
} from '@/lib/audit/workflow-log-reader'
import { OPS_LOG_SOURCES } from '@/lib/audit/workflow-logs'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Automation Audit | DTR',
  robots: {
    index: false,
    follow: false,
  },
}

interface PageProps {
  searchParams: Promise<{
    auth?: string
    q?: string
    range?: string
    run?: string
    source?: string
    status?: string
    table?: string
  }>
}

type RunStatus = 'failure' | 'running' | 'skipped' | 'success' | 'warning'
type TimeRange = '7d' | '30d' | '60d'

function parseSource(value: string | undefined): OpsLogSourceId | 'all' {
  if (value === undefined || value === 'all') {
    return 'all'
  }

  const match = OPS_LOG_SOURCES.find(source => source.id === value)
  return match?.id ?? 'all'
}

function parseStatus(value: string | undefined): RunStatus | 'all' {
  if (
    value === 'failure'
    || value === 'running'
    || value === 'skipped'
    || value === 'success'
    || value === 'warning'
  ) {
    return value
  }

  return 'all'
}

function parseRange(value: string | undefined): TimeRange {
  if (value === '30d' || value === '60d') {
    return value
  }

  return '7d'
}

function LoginError({ auth }: { auth?: string }) {
  if (auth === 'failed') {
    return (
      <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
        Invalid ops token.
      </p>
    )
  }

  if (auth === 'challenge') {
    return (
      <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
        Complete the verification challenge.
      </p>
    )
  }

  return null
}

function AuditLogin({ auth }: { auth?: string }) {
  return (
    <section className="min-h-screen px-4 py-16 text-neutral-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-bold tracking-normal">Automation Audit</h1>
        <p className="mt-3 text-base text-neutral-600">
          Enter the ops token to view scheduled cache refreshes, backups, R2 cleanup, and workflow diagnostics.
        </p>
        <div className="mt-5">
          <LoginError auth={auth} />
        </div>
        <Script
          async
          defer
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
        <form action={authenticateAudit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600">
            Ops token
            <input
              className="h-11 rounded-md border border-neutral-200 px-3 text-base text-neutral-950 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
              name="token"
              placeholder="OPS_SECRET"
              type="password"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              className="size-4 rounded border-neutral-300"
              name="remember"
              type="checkbox"
            />
            Remember me for 60 days
          </label>
          <div
            className="cf-turnstile"
            data-action="audit-login"
            data-sitekey={TURNSTILE_SITE_KEY}
          />
          <button className="h-11 rounded-md bg-neutral-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-neutral-800" type="submit">
            View audit console
          </button>
        </form>
      </div>
    </section>
  )
}

export default async function AuditPage({ searchParams }: PageProps) {
  const params = await searchParams
  const secret = getOpsSecret()
  const session = secret === undefined ? undefined : await readAuditSession(secret)

  if (session === undefined) {
    return <AuditLogin auth={params.auth} />
  }

  const source = parseSource(params.source)
  const status = parseStatus(params.status)
  const range = parseRange(params.range)
  const table = params.table ?? ''
  const q = params.q ?? ''
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 60
  const [summaries, selectedDetail] = await Promise.all([
    readRecentWorkflowRunSummaries({ days, limit: 200, sourceId: source }),
    readWorkflowRunDetail(params.run),
  ])

  return (
    <>
      <AuditSessionRefresher enabled={shouldRefreshAuditSession(session)} />
      <AuditConsole
        filters={{ q, range, source, status, table }}
        selectedDetail={selectedDetail}
        selectedKey={params.run}
        summaries={summaries}
      />
    </>
  )
}
