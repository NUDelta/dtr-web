import type { ArchivedLogManifest } from '@/lib/ops/audit-logs'
import { Check, HardDrive } from 'lucide-react'

interface ArchivedSnapshotsProps {
  manifests: ArchivedLogManifest[]
}

export default function ArchivedSnapshots({
  manifests,
}: ArchivedSnapshotsProps) {
  return (
    <section className="mt-5 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <HardDrive size={22} className="text-neutral-600" aria-hidden="true" />
        <h2 className="text-xl font-bold tracking-normal">Archived Snapshots</h2>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {manifests.map(manifest => (
          <article className="rounded-lg border border-neutral-200 p-4" key={manifest.key}>
            <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
              <Check size={16} aria-hidden="true" />
              {manifest.backupDate ?? 'Backup snapshot'}
            </div>
            <p className="mt-2 font-mono text-xs text-neutral-500">{manifest.key}</p>
            <p className="mt-3 text-sm text-neutral-600">
              {manifest.sources.map(item => `${item.sourceLabel}: ${item.logs}`).join(' · ')}
            </p>
          </article>
        ))}
        {manifests.length === 0 && (
          <p className="text-sm text-neutral-600">No archived log snapshots found.</p>
        )}
      </div>
    </section>
  )
}
