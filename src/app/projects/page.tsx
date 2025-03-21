import type { Metadata } from 'next';
import TeamMembers from '@/components/projects/TeamMembers';
import { fetchSigs } from '@/lib/sig';
import ReactMarkdown from 'react-markdown';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Projects | DTR',
  alternates: { canonical: 'https://dtr.northwestern.edu/projects' },
};

interface BannerImages {
  [key: string]: string;
}

export default async function Projects() {
  const sigs = await fetchSigs();

  const bannerImages: BannerImages = {
    'Agile Research Studios':
      '/sig-photos/agile-research-studios_banner-image.png',
    'Context-Aware Metacognitive Practices': 'sig-photos/camp_banner-image.png',
    'Networked Orchestration Technologies':
      'sig-photos/networked-orchestration-technologies_banner-image.png',
    'Opportunistic Collective Experiences':
      'sig-photos/opportunistic-collective-experiences.png',
    'Readily Available Learning Experiences':
      'sig-photos/readily-available-learning-experiences_banner-image.png',
    'Breaking Boundaries': 'sig-photos/breaking-boundaries_banner-image.png',
    'On-the-Go Crowdsourcing':
      'sig-photos/on-the-go-crowdsourcing_banner-image.png',
    'Playful Learning': 'sig-photos/playful-learning_banner-image.png',
    'Situational Crowdsourcing':
      'sig-photos/situational-crowdsourcing_banner-image.png',
    'Human-AI Tools': 'sig-photos/human-ai_banner-image.jpg',
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* SIG component */}
      {sigs.map(sig => (
        <div key={sig.id} className="bg-gray-50 p-8">
          {/* SIG name */}
          <h2 className="mb-4 text-3xl font-semibold">{sig.name}</h2>

          {/* SIG banner image */}
          <img
            src={bannerImages[sig.name]}
            className="w-full"
            alt={sig.name}
          />

          {/* SIG description */}
          <div className="prose-lg my-4">
            <ReactMarkdown>
              {sig.description}
            </ReactMarkdown>
          </div>

          {/* Projects in SIG */}
          <div className="my-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            {sig.projects.map(project => (
              <div key={project.id} className="mb-4">
                <a href={`/projects/${project.id}`}>
                  <h3 className="break-normal bg-yellow p-2 text-2xl font-semibold transition-colors hover:bg-dark-yellow">
                    {project.name}
                  </h3>
                </a>

                <div className="prose mt-2">
                  <ReactMarkdown>
                    {project.description}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>

          {/* Members of SIG */}
          <TeamMembers groupId={sig.id} members={sig.members} />
        </div>
      ))}
    </div>
  );
}
