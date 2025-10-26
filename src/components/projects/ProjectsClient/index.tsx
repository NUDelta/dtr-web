'use client'

import { AnimatePresence, MotionConfig } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { SearchBar } from '@/components/shared'
import { useSearchQuery } from '@/hooks/useSearch'
import SIGCard from './SIGCard'
import { balanceTwoColumns, estimateCollapsedHeight } from './utils'

interface ProjectsClientProps {
  sigs: SIG[]
  bannerImages: Record<string, string>
}

const ProjectsClient = ({ sigs, bannerImages }: ProjectsClientProps) => {
  // auto-collapse all on mount
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  useEffect(() => {
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setCollapsed(Object.fromEntries(sigs.map(s => [s.id, true])))
  }, [sigs])

  // reusable search state (with debounced query)
  const { query, setQuery, debouncedQuery, reset } = useSearchQuery('', 300)

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()
    if (!q) {
      return sigs
    }
    return sigs
      .map((sig) => {
        const projects = (sig.projects ?? []).filter((p) => {
          const hay = `${p.name} ${p.description ?? ''}`.toLowerCase()
          return hay.includes(q)
        })
        const sigMatches
          = sig.name.toLowerCase().includes(q)
            || (sig.description ?? '').toLowerCase().includes(q)
        return sigMatches ? sig : { ...sig, projects }
      })
      .filter(
        sig =>
          sig.name.toLowerCase().includes(q)
          || (sig.description ?? '').toLowerCase().includes(q)
          || (sig.projects?.length ?? 0) > 0,
      )
  }, [sigs, debouncedQuery])

  // Rebalance ONLY when `filtered` changes
  const [leftCol, rightCol] = useMemo(() => {
    const getH = (sig: SIG) => {
      const hasBanner = !!bannerImages[sig.name]
      return estimateCollapsedHeight(sig, hasBanner, sig.description ?? '')
    }
    return balanceTwoColumns(filtered, getH)
  }, [filtered, bannerImages])

  const toggle = (id: string) =>
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <MotionConfig reducedMotion="user">
      <section aria-labelledby="projects-controls">
        <h2 id="projects-controls" className="sr-only">
          Project controls
        </h2>

        {/* Search */}
        <div className="mb-6 mx-auto max-w-xl">
          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={reset}
            placeholder="Search SIGs & projects…"
            className="w-full"
          />
        </div>

        {/* Two independently stacked columns */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[leftCol, rightCol].map((col, i) => (
            <div
              key={i === 0 ? 'left-column' : 'right-column'}
              className="flex flex-col gap-6"
              role="list"
              aria-label={i === 0 ? 'SIG list (left column)' : 'SIG list (right column)'}
            >
              <AnimatePresence initial={false}>
                {col.map((sig) => {
                  const isCollapsed = collapsed[sig.id] ?? true
                  return (
                    <SIGCard
                      key={sig.id}
                      sig={sig}
                      isCollapsed={isCollapsed}
                      toggle={toggle}
                      bannerImages={bannerImages}
                    />
                  )
                })}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>
    </MotionConfig>
  )
}

export default ProjectsClient
