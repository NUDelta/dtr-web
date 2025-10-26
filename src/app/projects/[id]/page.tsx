import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import TeamMembers from '@/components/projects/TeamMembers'
import { MarkdownContents } from '@/components/shared'
import { getAllProjectIds, getProjects } from '@/lib/airtable/project'
import generateRssFeed from '@/utils/generate-rss-feed'

const ProjectPublications = dynamic(
  async () => (await import('@/components/projects/ProjectPublications')).default,
)
const ProjectVideo = dynamic(
  async () => (await import('@/components/projects/ProjectVideo')).default,
)

export async function generateStaticParams() {
  await generateRssFeed() // regenerate RSS at build
  const projectIds = await getAllProjectIds()
  return projectIds.map(id => ({ id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const id = (await params).id
  const projects = await getProjects([id])

  if (!Array.isArray(projects) || projects.length === 0) {
    return { title: `Project ${id} not found | DTR` }
  }

  const [project] = projects

  if (!project) {
    return { title: `Project ${id} not found | DTR` }
  }

  const ogImage = project.banner_image ?? undefined

  return {
    title: `${project.name} | DTR`,
    description: project.description,
    alternates: { canonical: `https://dtr.northwestern.edu/projects/${id}` },
    openGraph: {
      title: `${project.name} | DTR`,
      description: project.description,
      url: `https://dtr.northwestern.edu/projects/${id}`,
      images: ogImage !== undefined ? [ogImage] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.name} | DTR`,
      description: project.description,
      images: ogImage !== undefined ? [ogImage] : [],
    },
    robots: { index: true, follow: true },
  }
}

export default async function IndividualProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = (await params).id
  const projects = await getProjects([id], undefined, true)

  if (!Array.isArray(projects) || projects.length === 0) {
    notFound()
  }
  const [project] = projects
  if (!project) {
    notFound()
  }

  // JSON-LD (Project)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    'name': project.name,
    'description': project.description,
    'url': `https://dtr.northwestern.edu/projects/${project.id}`,
    'image': project.banner_image !== null
      ? `https://dtr.northwestern.edu/${project.banner_image}`
      : undefined,
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Back link */}
      <nav aria-label="Breadcrumb" className="mb-5">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm transition hover:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Projects
        </Link>
      </nav>

      {/* Title */}
      <header className="mb-4">
        <h1 className="text-balance text-4xl font-bold leading-tight">{project.name}</h1>
        <div className="mt-2 h-1 w-12 rounded-full bg-yellow-400" aria-hidden="true" />
      </header>

      {/* Banner Image */}
      {project.banner_image !== null && (
        <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-xl">
          <Image
            src={project.banner_image}
            alt={`${project.name} banner`}
            fill
            sizes="(max-width: 768px) 100vw, 864px"
            className="object-cover"
            priority={false}
          />
        </div>
      )}

      {/* Description */}
      <section aria-labelledby="desc" className="mb-8">
        <h2 id="desc" className="sr-only">Project description</h2>
        <div className="prose max-w-none text-neutral-800 prose-a:underline">
          <MarkdownContents content={project.description} />
        </div>
      </section>

      {/* Extra images */}
      {project.images?.explainerImages?.length > 0 && (
        <section aria-labelledby="figures" className="mb-10">
          <h2 id="figures" className="mb-3 text-2xl font-bold">Figures</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {project.images.explainerImages.map((img, i) => (
              <figure key={img.url} className="rounded-xl border border-neutral-200 bg-white p-3">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  <Image
                    src={img.url}
                    alt={`${project.name} image ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 416px"
                    className="object-cover"
                  />
                </div>
                {img.description?.trim() && (
                  <figcaption className="mt-2 text-sm text-neutral-700">
                    <MarkdownContents content={`Figure ${i + 1}: ${img.description}`} />
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Publications */}
      { project.publications?.length > 0
        && <ProjectPublications publications={project.publications} />}

      {/* Videos */}
      { project.demo_video !== null && project.demo_video.trim() !== ''
        && <ProjectVideo title="Demo video" url={project.demo_video} /> }
      { project.sprint_video !== null && project.sprint_video.trim() !== ''
        && <ProjectVideo title="Sprint video" url={project.sprint_video} /> }

      {/* Team Members */}
      <section aria-labelledby="team">
        <TeamMembers groupId={project.id} members={project.members} />
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </div>
  )
}
