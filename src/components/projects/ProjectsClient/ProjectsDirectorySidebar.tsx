'use client'

import type { DirectoryStatus, SIGDirectoryItem } from './types'
import { List } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '@/components/shared'

interface ProjectsDirectorySidebarProps {
  status: DirectoryStatus
  sigs: SIGDirectoryItem[]
  visibleProjectCount: number
}

interface SidebarContentProps {
  status: DirectoryStatus
  sigs: SIGDirectoryItem[]
  visibleProjectCount: number
  onNavigate?: () => void
}

const SidebarContent = ({
  status,
  sigs,
  visibleProjectCount,
  onNavigate,
}: SidebarContentProps) => {
  return (
    <>
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
        <nav className="mt-3 space-y-2" aria-label="Visible SIGs">
          {sigs.map((sig, index) => (
            <a
              key={sig.id}
              href={`#sig-${sig.id}`}
              onClick={onNavigate}
              className="flex items-start gap-3 rounded-2xl border border-transparent px-3 py-2 text-sm text-neutral-700 transition hover:border-yellow-200 hover:bg-yellow-50 hover:text-neutral-950 focus:outline-none focus-visible:border-yellow-300 focus-visible:bg-yellow-50 focus-visible:ring-2 focus-visible:ring-yellow-300"
            >
              <span className="inline-flex min-w-8 justify-center rounded-full bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-500">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="leading-5">{sig.name}</span>
            </a>
          ))}
        </nav>
      </div>
    </>
  )
}

const ProjectsDirectorySidebar = ({
  status,
  sigs,
  visibleProjectCount,
}: ProjectsDirectorySidebarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <div className="fixed inset-x-4 bottom-4 z-30 xl:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white/95 px-4 py-3 text-sm font-semibold text-neutral-900 shadow-lg backdrop-blur transition hover:border-yellow-300 hover:bg-yellow-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2"
        >
          <List size={18} aria-hidden="true" />
          Browse visible SIGs
        </button>
      </div>

      <Modal
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        title={`${status} SIG navigator`}
        subtitle="Jump between visible groups without losing your place."
      >
        <SidebarContent
          status={status}
          sigs={sigs}
          visibleProjectCount={visibleProjectCount}
          onNavigate={() => setMobileOpen(false)}
        />
      </Modal>

      <aside className="hidden xl:block xl:self-start">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-hidden rounded-[28px] border border-neutral-200 bg-white/95 p-5 shadow-sm backdrop-blur">
          <div className="h-full overflow-y-auto pr-1">
            <SidebarContent
              status={status}
              sigs={sigs}
              visibleProjectCount={visibleProjectCount}
            />
          </div>
        </div>
      </aside>
    </>
  )
}

export default ProjectsDirectorySidebar
