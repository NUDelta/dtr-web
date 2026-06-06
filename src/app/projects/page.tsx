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

export default async function ProjectsPage() {
  const sigs = await fetchSigs()

  return (
    <ProjectsClient sigs={sigs} />
  )
}

// Revalidate every hour; Airtable fetches are controlled by the 12h KV refresh.
export const revalidate = 3_600
