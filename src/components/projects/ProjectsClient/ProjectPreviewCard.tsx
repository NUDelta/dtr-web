import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { getProjectPreviewText } from './projectPreviewText'
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
  const previewText = project.description
    ? getProjectPreviewText(project.description)
    : ''

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-yellow-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 sm:p-5"
      aria-label={`Open project ${project.name}`}
    >
      <article className="h-full">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${statusClasses[status]}`}>
              {status}
            </span>
            <h4 className="text-base font-semibold tracking-tight text-neutral-950 sm:text-lg">
              {project.name}
            </h4>
          </div>

          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 transition group-hover:border-yellow-300 group-hover:text-neutral-950">
            View project
            <ArrowUpRight
              size={16}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
        </div>

        {previewText
          ? (
              <p className="mt-3 text-sm text-neutral-700">
                {previewText}
              </p>
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
