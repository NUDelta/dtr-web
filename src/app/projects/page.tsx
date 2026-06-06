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

/**
 * Legacy static banner fallback for SIG records that do not have an Airtable
 * attachment. Airtable/R2 remains the source of truth for normal rendering.
 */
const SIG_BANNER_FALLBACKS: Record<string, string> = {
  'Agile Research Studios': '/images/sig-photos/agile-research-studios_banner-image.png',
  'Context-Aware Metacognitive Practices': '/images/sig-photos/camp_banner-image.png',
  'Networked Orchestration Technologies': '/images/sig-photos/networked-orchestration-technologies_banner-image.png',
  'Opportunistic Collective Experiences': '/images/sig-photos/opportunistic-collective-experiences.png',
  'Readily Available Learning Experiences': '/images/sig-photos/readily-available-learning-experiences_banner-image.png',
  'Breaking Boundaries': '/images/sig-photos/breaking-boundaries_banner-image.png',
  'On-the-Go Crowdsourcing': '/images/sig-photos/on-the-go-crowdsourcing_banner-image.png',
  'Playful Learning': '/images/sig-photos/playful-learning_banner-image.png',
  'Situational Crowdsourcing': '/images/sig-photos/situational-crowdsourcing_banner-image.png',
  'Human-AI Tools': '/images/sig-photos/human-ai_banner-image.jpg',
  'Human Learning': '/images/sig-photos/humanlearning.png',
}

function withResolvedSigBanner(sig: SIG): SIG {
  if (sig.banner_image !== null) {
    return sig
  }

  return {
    ...sig,
    banner_image: SIG_BANNER_FALLBACKS[sig.name] ?? null,
  }
}

export default async function ProjectsPage() {
  const sigs = (await fetchSigs()).map(withResolvedSigBanner)

  return (
    <ProjectsClient sigs={sigs} />
  )
}

// Revalidate every hour; Airtable fetches are controlled by the 12h KV refresh.
export const revalidate = 3_600
