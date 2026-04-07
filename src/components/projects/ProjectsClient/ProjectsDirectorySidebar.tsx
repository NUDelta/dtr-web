'use client'

import type { MouseEvent } from 'react'
import type { DirectoryStatus, SIGDirectoryItem } from './types'
import { List } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Modal } from '@/components/shared'

interface ProjectsDirectorySidebarProps {
  status: DirectoryStatus
  sigs: SIGDirectoryItem[]
}

interface SidebarContentProps {
  sigs: SIGDirectoryItem[]
  activeSigId: string | null
  onNavigate?: () => void
}

const DESKTOP_REVEAL_OFFSET = 120
const DESKTOP_SECTION_OFFSET = 144

const SidebarContent = ({
  sigs,
  activeSigId,
  onNavigate,
}: SidebarContentProps) => {
  const handleSigClick = (event: MouseEvent<HTMLAnchorElement>, sigId: string) => {
    event.preventDefault()

    const target = document.getElementById(`sig-${sigId}`)
    if (!target) {
      return
    }

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
    window.history.replaceState(null, '', `#sig-${sigId}`)
    onNavigate?.()
  }

  return (
    <nav className="space-y-2" aria-label="Visible SIGs">
      {sigs.map((sig, index) => (
        <a
          key={sig.id}
          href={`#sig-${sig.id}`}
          onClick={event => handleSigClick(event, sig.id)}
          aria-current={activeSigId === sig.id ? 'location' : undefined}
          className={`flex items-start gap-3 rounded-2xl border px-3 py-2 text-sm transition focus:outline-none focus-visible:border-yellow-300 focus-visible:bg-yellow-50 focus-visible:ring-2 focus-visible:ring-yellow-300 ${
            activeSigId === sig.id
              ? 'border-yellow-300 bg-yellow-50 text-neutral-950 shadow-sm'
              : 'border-transparent text-neutral-700 hover:border-yellow-200 hover:bg-yellow-50 hover:text-neutral-950'
          }`}
        >
          <span
            className={`inline-flex min-w-8 justify-center rounded-full px-2 py-1 text-xs font-semibold ${
              activeSigId === sig.id
                ? 'bg-yellow-200 text-yellow-900'
                : 'bg-neutral-100 text-neutral-500'
            }`}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="leading-5">{sig.name}</span>
        </a>
      ))}
    </nav>
  )
}

const ProjectsDirectorySidebar = ({
  status,
  sigs,
}: ProjectsDirectorySidebarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSigId, setActiveSigId] = useState<string | null>(null)
  const [showDesktopSidebar, setShowDesktopSidebar] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    let frameId = 0

    const updateSidebarState = () => {
      const results = document.getElementById('projects-results')
      if (!results) {
        setShowDesktopSidebar(false)
        return
      }

      setShowDesktopSidebar(results.getBoundingClientRect().top <= DESKTOP_REVEAL_OFFSET)
    }

    const updateActiveSection = () => {
      const sections = sigs
        .map(sig => document.getElementById(`sig-${sig.id}`))
        .filter((section): section is HTMLElement => section instanceof HTMLElement)

      if (sections.length === 0) {
        setActiveSigId(null)
        return
      }

      let currentSectionId = sigs[0]?.id ?? null

      for (const section of sections) {
        if (section.getBoundingClientRect().top <= DESKTOP_SECTION_OFFSET) {
          currentSectionId = section.id.replace('sig-', '')
        }
        else {
          break
        }
      }

      setActiveSigId(currentSectionId)
    }

    const update = () => {
      updateSidebarState()
      updateActiveSection()
      frameId = 0
    }

    const handleViewportChange = () => {
      if (frameId !== 0) {
        return
      }

      frameId = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', handleViewportChange, { passive: true })
    window.addEventListener('resize', handleViewportChange)

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId)
      }
      window.removeEventListener('scroll', handleViewportChange)
      window.removeEventListener('resize', handleViewportChange)
    }
  }, [sigs])

  return (
    <>
      <div className="fixed right-4 bottom-4 z-30 2xl:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white/95 px-4 py-3 text-sm font-semibold text-neutral-900 shadow-lg backdrop-blur transition hover:border-yellow-300 hover:bg-yellow-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2"
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
          sigs={sigs}
          activeSigId={activeSigId}
          onNavigate={() => setMobileOpen(false)}
        />
      </Modal>

      <aside className="hidden 2xl:block 2xl:relative 2xl:self-start">
        <div
          className={`fixed top-28 left-[calc(50%+31rem)] z-20 max-h-[calc(100vh-8rem)] w-[18rem] overflow-hidden rounded-[28px] border border-neutral-200 bg-white/95 p-5 shadow-sm backdrop-blur transition duration-200 ${
            showDesktopSidebar
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none -translate-y-3 opacity-0'
          }`}
        >
          <div className="h-full overflow-y-auto pr-1">
            <SidebarContent
              sigs={sigs}
              activeSigId={activeSigId}
            />
          </div>
        </div>
      </aside>
    </>
  )
}

export default ProjectsDirectorySidebar
