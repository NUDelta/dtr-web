import type { Metadata } from 'next'
import { MarkdownContents } from '@/components/shared'
import { readMarkdownFile } from '@/utils/read-md'

export const metadata: Metadata = {
  title: 'Method | DTR',
  description: 'Discover the DTR method, a unique approach to mentoring and learning that emphasizes growth, reflection, and community engagement.',
  alternates: { canonical: 'https://dtr.northwestern.edu/method' },
}

export default async function Method() {
  const methodContent = await readMarkdownFile('method.md')
  return <MarkdownContents content={methodContent} />
}
