import type { Metadata } from 'next'
import ProjectsClient from '@/components/projects/ProjectsClient' // (new client component below)
import { fetchSigs } from '@/lib/airtable/sig'

export const metadata: Metadata = {
  title: 'Projects | DTR',
  description:
    'Explore DTR Special Interest Groups (SIGs), their projects, and teams. Filter by topic and quickly jump to details.',
  alternates: { canonical: 'https://dtr.northwestern.edu/projects' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Projects | DTR',
    url: 'https://dtr.northwestern.edu/projects',
    type: 'website',
  },
}

interface BannerImages {
  [key: string]: string
}

const bannerImages: BannerImages = {
  'Agile Research Studios': 'images/sig-photos/agile-research-studios_banner-image.png',
  'Context-Aware Metacognitive Practices': 'images/sig-photos/camp_banner-image.png',
  'Networked Orchestration Technologies': 'images/sig-photos/networked-orchestration-technologies_banner-image.png',
  'Opportunistic Collective Experiences': 'images/sig-photos/opportunistic-collective-experiences.png',
  'Readily Available Learning Experiences': 'images/sig-photos/readily-available-learning-experiences_banner-image.png',
  'Breaking Boundaries': 'images/sig-photos/breaking-boundaries_banner-image.png',
  'On-the-Go Crowdsourcing': 'images/sig-photos/on-the-go-crowdsourcing_banner-image.png',
  'Playful Learning': 'images/sig-photos/playful-learning_banner-image.png',
  'Situational Crowdsourcing': 'images/sig-photos/situational-crowdsourcing_banner-image.png',
  'Human-AI Tools': 'images/sig-photos/human-ai_banner-image.jpg',
}

export default async function ProjectsPage() {
  const sigs = await fetchSigs()

  return (
    <>
      <header className="mb-8">
        <h1 className="text-balance text-4xl font-bold leading-tight">SIGs & Projects</h1>
        <p className="mt-2 max-w-3xl text-lg text-neutral-700">
          Browse our Special Interest Groups (SIGs), discover current projects, and meet the teams behind them.
          Use search and filters to quickly narrow down.
        </p>
      </header>

      <ProjectsClient
        sigs={sigs}
        bannerImages={bannerImages}
      />
    </>
  )
}
