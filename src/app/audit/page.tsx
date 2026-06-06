import type { Metadata } from 'next'
import type { OpsLogSourceId } from '@/lib/audit/workflow-logs'
import Script from 'next/script'
import { authenticateAudit } from '@/app/audit/actions'
import AuditLoginForm from '@/app/audit/AuditLoginForm'
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
} from '@/lib/audit/workflow-log-reader'
import { OPS_LOG_SOURCES } from '@/lib/audit/workflow-logs'
import { groupWorkflowRunSummaries } from '@/lib/audit/workflow-run-grouping'

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
    page?: string
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

function parsePage(value: string | undefined): number {
  if (value === undefined) {
    return 1
  }

  const parsed = Number.parseInt(value, 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

function AuditLogin({ auth }: { auth?: string }) {
  return (
    <section className="min-h-[calc(100dvh-12rem)] px-4 py-10 text-neutral-950 sm:px-6 lg:px-8">
      <div className="audit-login-card mx-auto max-w-xl overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-xl shadow-neutral-950/5">
        <div className="border-b border-neutral-200 bg-linear-to-br from-neutral-50 via-white to-yellow-50/70 px-6 py-7 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Ops
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal sm:text-4xl">Automation Audit</h1>
          <p className="mt-3 text-base text-neutral-600">
            Enter the ops token to view scheduled cache refreshes, backups, R2 cleanup, and workflow diagnostics.
          </p>
        </div>
        <div className="px-6 py-6 sm:px-8">
          <AuditLoginForm
            action={authenticateAudit}
            auth={auth}
            turnstileSiteKey={TURNSTILE_SITE_KEY}
          />
        </div>
        <Script
          async
          defer
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
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
  const page = parsePage(params.page)
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 60
  const rawSummaries = await readRecentWorkflowRunSummaries({ days, limit: 200, sourceId: source })
  const summaries = groupWorkflowRunSummaries(rawSummaries)
  const selectedDetailKey = summaries.some(summary => summary.detailKey === params.run)
    ? params.run
    : undefined

  return (
    <>
      <AuditSessionRefresher enabled={shouldRefreshAuditSession(session)} />
      <AuditConsole
        filters={{ q, page, range, source, status, table }}
        selectedKey={selectedDetailKey}
        summaries={summaries}
      />
    </>
  )
}
