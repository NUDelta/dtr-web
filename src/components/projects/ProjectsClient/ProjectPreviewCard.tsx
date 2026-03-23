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
    <Link
      href={`/projects/${project.id}`}
      className="group block rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-yellow-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2"
      aria-label={`Open project ${project.name}`}
    >
      <article className="h-full">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-3">
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${statusClasses[status]}`}>
              {status}
            </span>
            <h4 className="text-lg font-semibold tracking-tight text-neutral-950">
              {project.name}
            </h4>
          </div>

          <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 transition group-hover:border-yellow-300 group-hover:text-neutral-950">
            View project
            <ArrowUpRight
              size={16}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
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
    </Link>
  )
}

export default ProjectPreviewCard
