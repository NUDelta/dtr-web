import type { MetadataRoute } from 'next'
import { getCachedRecords } from '@/lib/airtable/airtable'

const BASE_URL = 'https://dtr.northwestern.edu'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch dynamic project slugs from Airtable
  const projects = await getCachedRecords<AirtableProject>('Projects')
  const projectUrls: MetadataRoute.Sitemap = projects.map(project => ({
    url: `${BASE_URL}/projects/${project.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  // Static routes
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: 'yearly', priority: 1 },
    { url: `${BASE_URL}/apply`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/how-we-work`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.7 },
    { url: `${BASE_URL}/letters`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/method`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.7 },
    { url: `${BASE_URL}/people`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/projects`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/what-we-learn`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.7 },
  ]

  return [...staticUrls, ...projectUrls]
}
