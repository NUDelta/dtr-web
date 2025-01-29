import type { Metadata } from 'next';
import ProjectPublications from '@/components/people/ProjectPublications';
import TeamMembers from '@/components/people/TeamMembers';
import ProjectVideo from '@/components/projects/ProjectVideo';
import { getCachedRecords } from '@/lib/airtable';
import { getProject } from '@/lib/project';
import ReactMarkdown from 'react-markdown';

export async function generateStaticParams() {
  const projects = await getCachedRecords('Projects');
  return projects.map(project => ({
    params: { id: project.id },
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const id = (await params).id;
  const project = await getProject(id, true);

  if (!project) {
    return {
      title: `Project ${id} not found | DTR`,
    };
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
  };
}

export default async function IndividualProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const project = await getProject(id, true);

  if (!project) {
    console.warn(`Project ${id} not found`);
    return <div>Project not found</div>;
  }

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
      <ReactMarkdown className="prose-lg my-8">
        {project.description ?? ''}
      </ReactMarkdown>

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
              <ReactMarkdown className="text-sm">
                {`Figure ${i + 1}: ${img.description}`}
              </ReactMarkdown>
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
