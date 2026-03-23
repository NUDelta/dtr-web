import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { MarkdownContents } from '@/components/shared'
import { normalizeProjectDirectoryStatus } from './utils'

interface ProjectPreviewCardProps {
  project: PartialProject
}

const statusClasses = {
  Active: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  Inactive: 'border-neutral-200 bg-neutral-100 text-neutral-700',
} as const

const ProjectPreviewCard = ({ project }: ProjectPreviewCardProps) => {
  const status = normalizeProjectDirectoryStatus(project.status)

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-3">
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${statusClasses[status]}`}>
            {status}
          </span>
          <h4 className="text-lg font-semibold tracking-tight text-neutral-950">
            {project.name}
          </h4>
        </div>

        <Link
          href={`/projects/${project.id}`}
          className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-yellow-400 hover:text-neutral-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
        >
          View project
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>

      {project.description
        ? (
            <div className="prose prose-sm mt-3 max-w-none text-neutral-700 prose-p:my-0">
              <MarkdownContents content={project.description} />
            </div>
          )
        : (
            <p className="mt-3 text-sm text-neutral-600">
              Description coming soon.
            </p>
          )}
    </article>
  )
}

export default ProjectPreviewCard
