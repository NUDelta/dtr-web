import type { Metadata } from 'next'
import { MarkdownContents } from '@/components/shared'
import { readMarkdownFile } from '@/utils'

export const metadata: Metadata = {
  title: 'Apply | DTR',
  description: 'Join the DTR community by applying to become a mentee. Learn more about our application process and how to get involved.',
  alternates: { canonical: 'https://dtr.northwestern.edu/apply' },
}

export default async function Apply() {
  const applyContent = await readMarkdownFile('apply.md')
  return <MarkdownContents content={applyContent} />
}
