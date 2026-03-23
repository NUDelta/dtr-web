import type { DirectoryStatus, SIGDirectoryItem } from './types'
import { FolderKanban, Users } from 'lucide-react'
import TeamMembers from '@/components/projects/TeamMembers'
import { AdaptiveImage, MarkdownContents } from '@/components/shared'
import ProjectPreviewCard from './ProjectPreviewCard'

interface SIGSectionProps {
  sig: SIGDirectoryItem
  currentStatus: DirectoryStatus
  bannerImages: Record<string, string>
}

const SIGSection = ({
  sig,
  currentStatus,
  bannerImages,
}: SIGSectionProps) => {
  const banner = bannerImages[sig.name] ?? sig.banner_image ?? undefined
  const primaryProjects = currentStatus === 'Active' ? sig.activeProjects : sig.inactiveProjects
  const showInactiveProjects = currentStatus === 'Active' && sig.inactiveProjects.length > 0

  return (
    <article className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm">
      {banner && (
        <div className="relative aspect-[16/6] overflow-hidden border-b border-neutral-200">
          <AdaptiveImage
            src={banner}
            alt={`${sig.name} banner`}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" aria-hidden="true" />
        </div>
      )}

      <div className="space-y-6 p-6">
        <header className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-900">
              {sig.status}
              {' '}
              SIG
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700">
              <FolderKanban size={14} aria-hidden="true" />
              {sig.projectCounts.total}
              {' '}
              project
              {sig.projectCounts.total === 1 ? '' : 's'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700">
              <Users size={14} aria-hidden="true" />
              {sig.memberCount}
              {' '}
              member
              {sig.memberCount === 1 ? '' : 's'}
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-950">
              {sig.name}
            </h2>
            <div className="prose max-w-none text-neutral-700 prose-p:my-0 prose-a:text-neutral-900 prose-a:underline">
              {sig.description
                ? <MarkdownContents content={sig.description} />
                : <p>Description coming soon.</p>}
            </div>
          </div>
        </header>

        {primaryProjects.length > 0 && (
          <section aria-labelledby={`sig-projects-${sig.id}`} className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 id={`sig-projects-${sig.id}`} className="text-xl font-semibold text-neutral-950">
                {currentStatus === 'Active' ? 'Active projects' : 'Inactive projects'}
              </h3>
              <p className="text-sm text-neutral-500">
                {primaryProjects.length}
                {' '}
                shown
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {primaryProjects.map(project => (
                <ProjectPreviewCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        )}

        {showInactiveProjects && (
          <section aria-labelledby={`sig-inactive-projects-${sig.id}`} className="space-y-4 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 id={`sig-inactive-projects-${sig.id}`} className="text-lg font-semibold text-neutral-900">
                Inactive projects
              </h3>
              <p className="text-sm text-neutral-500">
                {sig.inactiveProjects.length}
                {' '}
                archived in this SIG
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {sig.inactiveProjects.map(project => (
                <ProjectPreviewCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        )}

        <div className="border-t border-neutral-200 pt-6">
          <TeamMembers groupId={sig.id} members={sig.members} />
        </div>
      </div>
    </article>
  )
}

export default SIGSection
