import type { DirectoryStatus, SIGDirectoryItem } from './types'

interface ProjectsDirectorySidebarProps {
  status: DirectoryStatus
  sigs: SIGDirectoryItem[]
  visibleProjectCount: number
}

const ProjectsDirectorySidebar = ({
  status,
  sigs,
  visibleProjectCount,
}: ProjectsDirectorySidebarProps) => {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24 rounded-[28px] border border-neutral-200 bg-white/95 p-5 shadow-sm backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Browse overview
        </p>
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-sm text-neutral-500">
              {status}
              {' '}
              SIGs
            </p>
            <p className="mt-1 text-2xl font-semibold text-neutral-950">{sigs.length}</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-sm text-neutral-500">Visible projects</p>
            <p className="mt-1 text-2xl font-semibold text-neutral-950">{visibleProjectCount}</p>
          </div>
        </div>

        <div className="mt-5 border-t border-neutral-200 pt-5">
          <p className="text-sm font-semibold text-neutral-950">Jump to SIG</p>
          <nav className="mt-3 max-h-[28rem] space-y-2 overflow-y-auto pr-1" aria-label="Visible SIGs">
            {sigs.map((sig, index) => (
              <a
                key={sig.id}
                href={`#sig-${sig.id}`}
                className="flex items-start gap-3 rounded-2xl border border-transparent px-3 py-2 text-sm text-neutral-700 transition hover:border-yellow-200 hover:bg-yellow-50 hover:text-neutral-950"
              >
                <span className="inline-flex min-w-8 justify-center rounded-full bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-500">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="leading-5">{sig.name}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  )
}

export default ProjectsDirectorySidebar
