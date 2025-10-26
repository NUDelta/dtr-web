import { BookOpen, ExternalLink } from 'lucide-react'

interface ProjectPublicationsProps {
  publications: ProjectPublication[]
}

const ProjectPublications = ({ publications }: ProjectPublicationsProps) => {
  return (
    <section aria-labelledby="pubs" className="mb-10 w-full">
      <h2 id="pubs" className="mb-2 text-2xl font-bold">Publications</h2>
      <div className="mb-3 h-1 w-10 rounded-full bg-yellow-300" aria-hidden="true" />

      <ul role="list" className="space-y-2">
        {publications.map(p => (
          <li key={p.id} className="rounded-lg border border-neutral-200 bg-white p-3 transition-transform hover:shadow-lg hover:shadow-yellow-100/30 hover:-translate-y-0.5">
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <BookOpen size={16} className="text-yellow-700" aria-hidden="true" />
                  <span className="truncate font-medium">
                    {p.name}
                  </span>
                </div>
                <div className="shrink-0 text-sm text-neutral-600">
                  {[p.conference].filter(Boolean).join(' · ')}
                </div>
              </div>
              <div className="mt-1">
                <p
                  className="inline-flex items-center gap-1 text-sm underline decoration-neutral-400 underline-offset-2 hover:text-neutral-900"
                  aria-label={`Open publication: ${p.name}`}
                >
                  View paper
                  {' '}
                  <ExternalLink size={14} aria-hidden="true" />
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ProjectPublications
