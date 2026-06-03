import type { AuditFilters as AuditFiltersValue } from './lib/types'
import { Search } from 'lucide-react'
import { OPS_LOG_SOURCES } from '@/lib/audit/workflow-logs'
import { STATUS_META } from './statusMeta'

interface AuditFiltersProps {
  filters: AuditFiltersValue
  tables: string[]
}

export default function AuditFilters({
  filters,
  tables,
}: AuditFiltersProps) {
  return (
    <form className="mt-5 grid gap-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(260px,2fr)]" method="get">
      <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600">
        Source
        <select className="h-12 rounded-md border border-neutral-200 bg-white px-3 text-base text-neutral-950" defaultValue={filters.source} name="source">
          <option value="all">All</option>
          {OPS_LOG_SOURCES.map(source => (
            <option key={source.id} value={source.id}>{source.label}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600">
        Status
        <select className="h-12 rounded-md border border-neutral-200 bg-white px-3 text-base text-neutral-950" defaultValue={filters.status} name="status">
          <option value="all">All</option>
          {Object.entries(STATUS_META).map(([value, meta]) => (
            <option key={value} value={value}>{meta.label}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600">
        Time range
        <select className="h-12 rounded-md border border-neutral-200 bg-white px-3 text-base text-neutral-950" defaultValue={filters.range} name="range">
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="60d">Last 60 days</option>
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600">
        Table
        <select className="h-12 rounded-md border border-neutral-200 bg-white px-3 text-base text-neutral-950" defaultValue={filters.table} name="table">
          <option value="">All</option>
          {tables.map(table => (
            <option key={table} value={table}>{table}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600">
        Search
        <span className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-500" size={20} aria-hidden="true" />
          <input
            className="h-12 w-full rounded-md border border-neutral-200 bg-white pr-3 pl-10 text-base text-neutral-950"
            defaultValue={filters.q}
            name="q"
            placeholder="Search runs..."
          />
        </span>
      </label>
      <button className="sr-only" type="submit">Apply filters</button>
    </form>
  )
}
