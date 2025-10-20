import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import ProjectPublications from '@/components/projects/ProjectPublications';
import ProjectVideo from '@/components/projects/ProjectVideo';
import TeamMembers from '@/components/projects/TeamMembers';
import { getAllProjectIds, getProjects } from '@/lib/project';

// Next.js will invalidate the cache when a request comes in
// Revalidate every 6 hours, maximum 124 times per month
export const revalidate = 21600;

// We'll prerender only the params from `generateStaticParams` at build time.
// If a request comes in for a path that hasn't been generated,
// Next.js will server-render the page on-demand.
export const dynamicParams = true; // or false, to 404 on unknown paths

export async function generateStaticParams() {
  const projectIds = await getAllProjectIds();
  return projectIds.map(id => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const id = (await params).id;
  const projects = await getProjects([id], true);

  if (Array.isArray(projects) && projects.length === 0) {
    return {
      title: `Project ${id} not found | DTR`,
    };
  }

  const [project] = projects;

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
  };
}

export default async function IndividualProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const projects = await getProjects([id], true);

  if (Array.isArray(projects) && projects.length === 0) {
    notFound();
  }

  const [project] = projects;

  return (
    <div className="mx-auto max-w-4xl bg-gray-50 p-4">
      {/* Title */}
      <h2 className="mb-4 text-3xl font-semibold">{project.name}</h2>

      {/* Banner Image */}
      {project.banner_image !== null && (
        <img
          src={project.banner_image}
          className="w-full"
          alt={project.name}
        />
      )}

      {/* Description */}
      <div className="prose-lg my-8">
        <ReactMarkdown>
          {project.description ?? ''}
        </ReactMarkdown>
      </div>

      {/* Extra images */}
      <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        {project.images.explainerImages.map((img, i) => (
          <div key={img.url}>
            <img
              src={img.url}
              className="mb-4 w-full"
              alt={`${project.name} image ${i + 1}`}
            />
            {img.description.trim() !== ''
              && (
                <div className="text-sm">
                  <ReactMarkdown>
                    {`Figure ${i + 1}: ${img.description}`}
                  </ReactMarkdown>
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
  );
}
