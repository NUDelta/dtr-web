import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import ProjectPublications from '@/components/projects/ProjectPublications'
import ProjectVideo from '@/components/projects/ProjectVideo'
import TeamMembers from '@/components/projects/TeamMembers'
import { MarkdownContents } from '@/components/shared'
import { getAllProjectIds, getProjects } from '@/lib/airtable/project'
import generateRssFeed from '@/utils/generate-rss-feed'

export async function generateStaticParams() {
  await generateRssFeed() // regenerate RSS feed at build time
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

  if (Array.isArray(projects) && projects.length === 0) {
    return {
      title: `Project ${id} not found | DTR`,
    }
  }

  const [project] = projects

  if (!project) {
    return {
      title: `Project ${id} not found | DTR`,
    }
  }

  return {
    title: `${project.name} | DTR`,
    description: project.description,
    alternates: { canonical: `https://dtr.northwestern.edu/projects/${id}` },
    openGraph: {
      images: project.banner_image ?? '',
    },
    twitter: {
      images: project.banner_image ?? '',
    },
  }
}

export default async function IndividualProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = (await params).id
  const projects = await getProjects([id], undefined, true)

  if (Array.isArray(projects) && projects.length === 0) {
    notFound()
  }

  const [project] = projects

  if (!project) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl bg-gray-50 p-4">
      {/* Title */}
      <h2 className="mb-4 text-3xl font-semibold">{project.name}</h2>

      {/* Banner Image */}
      {project.banner_image !== null && (
        <Image
          src={project.banner_image}
          className="w-full"
          alt={project.name}
          width={864}
          height={540}
        />
      )}

      {/* Description */}
      <div className="prose-lg my-8">
        <MarkdownContents content={project.description} />
      </div>

      {/* Extra images */}
      <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        {project.images.explainerImages.map((img, i) => (
          <div key={img.url}>
            <Image
              src={img.url}
              className="mb-4 w-full"
              alt={`${project.name} image ${i + 1}`}
              width={416}
              height={210}
            />
            {img.description.trim() !== ''
              && (
                <div className="text-sm">
                  <MarkdownContents content={`Figure ${i + 1}: ${img.description}`} />
                </div>
              )}
          </div>
        ))}
      </div>

      {/* Publications or Additional Content (e.g., Slides) */}
      <ProjectPublications publications={project.publications} />

      {/* Demo Video */}
      <ProjectVideo title="Demo video" url={project.demo_video} />
      {/* Sprint Video */}
      <ProjectVideo title="Sprint video" url={project.sprint_video} />

      {/* Team Members */}
      <TeamMembers groupId={project.id} members={project.members} />
    </div>
  )
}
