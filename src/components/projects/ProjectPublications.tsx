import Link from 'next/link'

interface ProjectPublicationsProps {
  publications: ProjectPublication[]
}

export default function ProjectPublications({ publications }: ProjectPublicationsProps) {
  if (!publications.length) {
    return null
  }

  return (
    <div className="mb-8 w-full">
      <h3 className="mb-2 border-b border-black pb-2 text-2xl font-bold">Publications</h3>
      <ul className="prose max-w-none list-none font-medium">
        {publications.map(publication => (
          <li key={publication.id}>
            <Link href={publication.url} target="_blank" rel="noreferrer noopener">
              {publication.name}
            </Link>
            ,
            {' '}
            {publication.conference}
          </li>
        ))}
      </ul>
    </div>
  )
}
