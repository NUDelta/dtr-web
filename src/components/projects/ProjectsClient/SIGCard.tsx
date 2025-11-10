import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import TeamMembers from '@/components/projects/TeamMembers'
import { MarkdownContents } from '@/components/shared'
import { getImageSources } from '@/utils/get-image-sources'
import { cardAppear, collapseVariants } from './utils'

interface SIGCardProps {
  sig: SIG
  isCollapsed: boolean
  toggle: (id: string) => void
  bannerImages: Record<string, string>
}

const SIGCard = ({
  sig,
  isCollapsed,
  toggle,
  bannerImages,
}: SIGCardProps) => {
  const banner = bannerImages[sig.name]

  const sources = banner ? getImageSources(banner) : null

  return (
    <motion.article
      role="listitem"
      key={sig.id}
      id={sig.id}
      {...cardAppear}
      className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 shadow-sm"
    >
      {/* top bar */}
      <div className="h-1.5 w-full bg-yellow-400" aria-hidden="true" />

      {sources && (
        <div className="relative aspect-16/7 w-full overflow-hidden">
          <picture>
            <source srcSet={sources.avif} type="image/avif" />
            <source srcSet={sources.webp} type="image/webp" />
            <img
              src={sources.fallback}
              alt={`${sig.name} banner`}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </picture>
        </div>
      )}

      {/* Header + toggle */}
      <div className="flex items-start justify-between gap-3 p-5">
        <div>
          <h3 className="text-pretty text-2xl font-semibold">{sig.name}</h3>
          <div className="mt-1 h-1 w-10 rounded-full bg-yellow-300" aria-hidden="true" />
        </div>
        <button
          type="button"
          aria-expanded={!isCollapsed}
          aria-controls={`content-${sig.id}`}
          onClick={() => toggle(sig.id)}
          className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm transition
                                     hover:border-yellow-500 hover:shadow focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          <motion.span
            initial={false}
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.20 }}
            className="inline-block text-yellow-700"
            aria-hidden="true"
          >
            <ChevronDown size={16} />
          </motion.span>
          <span className="text-neutral-800">{isCollapsed ? 'Show Projects' : 'Hide Projects'}</span>
        </button>
      </div>

      <div className="px-5 mb-3">
        {sig.description
          ? (
              <div className="prose max-w-none text-neutral-800 prose-a:underline">
                <MarkdownContents content={sig.description} />
              </div>
            )
          : (
              <p className="text-neutral-700">No description.</p>
            )}
      </div>

      {/* Collapsible area */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            id={`content-${sig.id}`}
            key={`content-${sig.id}`}
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={collapseVariants}
            style={{ overflow: 'hidden' }}
          >
            <div className="p-5">
              <h4 className="mb-3 text-lg font-bold">Projects</h4>
              <ul role="list" className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {(sig.projects ?? []).map(project => (
                  <li
                    key={project.id}
                    className="rounded-lg border border-neutral-200 bg-white p-4 transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <Link
                      href={`/projects/${project.id}`}
                      className="inline-block"
                      aria-label={`Open project ${project.name}`}
                    >
                      <h5 className="mb-1 text-base font-semibold">
                        {project.name}
                      </h5>
                      {project.description && (
                        <div className="prose prose-sm max-w-none text-neutral-700">
                          <MarkdownContents content={project.description} />
                        </div>
                      )}
                    </Link>

                  </li>
                ))}
                {(sig.projects ?? []).length === 0 && (
                  <li className="italic text-neutral-600">No projects yet.</li>
                )}
              </ul>
            </div>

            <div className="border-t border-neutral-200 p-5">
              <TeamMembers groupId={sig.id} members={sig.members} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

export default SIGCard
