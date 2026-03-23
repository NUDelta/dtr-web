import type { DirectoryStatus, SIGDirectoryItem } from './types'
import { ChevronDown, FolderKanban, Users } from 'lucide-react'
import { useState } from 'react'
import TeamMembers from '@/components/projects/TeamMembers'
import { groupMembersByRole } from '@/components/projects/TeamMembers/utils'
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
  const hasInactiveProjects = currentStatus === 'Active' && sig.inactiveProjects.length > 0
  const [inactiveProjectsOverride, setInactiveProjectsOverride] = useState<boolean | null>(null)
  const [showTeam, setShowTeam] = useState(false)
  const showInactiveProjects = inactiveProjectsOverride ?? sig.shouldAutoExpandInactive
  const groupedMembers = groupMembersByRole(sig.members)
  const memberSummary = [
    { label: 'Faculty', count: groupedMembers.Faculty.length },
    { label: 'Students', count: groupedMembers.Students.length },
    { label: 'Affiliates', count: groupedMembers['Affiliates & Others'].length },
  ].filter(item => item.count > 0)

  return (
    <article className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm">
      {banner && (
        <div className="relative aspect-16/6 overflow-hidden border-b border-neutral-200">
          <AdaptiveImage
            src={banner}
            alt={`${sig.name} banner`}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-transparent" aria-hidden="true" />
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {primaryProjects.map(project => (
                <ProjectPreviewCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        )}

        {hasInactiveProjects && (
          <section aria-labelledby={`sig-inactive-projects-${sig.id}`} className="space-y-4 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 id={`sig-inactive-projects-${sig.id}`} className="text-lg font-semibold text-neutral-900">
                  Inactive projects
                </h3>
                <p className="text-sm text-neutral-500">
                  {sig.inactiveProjects.length}
                  {' '}
                  archived in this SIG
                </p>
              </div>
              <button
                type="button"
                aria-expanded={showInactiveProjects}
                aria-controls={`sig-inactive-project-grid-${sig.id}`}
                onClick={() => setInactiveProjectsOverride(value => !(value ?? sig.shouldAutoExpandInactive))}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-yellow-300 hover:text-neutral-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
              >
                {showInactiveProjects ? 'Hide' : 'Show'}
                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  className={`transition-transform duration-200 ${showInactiveProjects ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            {showInactiveProjects && (
              <div id={`sig-inactive-project-grid-${sig.id}`} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {sig.inactiveProjects.map(project => (
                  <ProjectPreviewCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </section>
        )}

        <section className="border-t border-neutral-200 pt-6" aria-labelledby={`sig-team-summary-${sig.id}`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 id={`sig-team-summary-${sig.id}`} className="text-lg font-semibold text-neutral-950">
                  Team
                </h3>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-sm text-neutral-600">
                  {sig.memberCount}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {memberSummary.map(({ label, count }) => (
                  <span
                    key={label}
                    className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700"
                  >
                    {count}
                    {' '}
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              aria-expanded={showTeam}
              aria-controls={`sig-team-details-${sig.id}`}
              onClick={() => setShowTeam(value => !value)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-yellow-300 hover:text-neutral-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
            >
              {showTeam ? 'Hide team' : 'Show team'}
              <ChevronDown
                size={16}
                aria-hidden="true"
                className={`transition-transform duration-200 ${showTeam ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {showTeam && (
            <div id={`sig-team-details-${sig.id}`} className="mt-5">
              <TeamMembers groupId={sig.id} members={sig.members} />
            </div>
          )}
        </section>
      </div>
    </article>
  )
}

export default SIGSection
