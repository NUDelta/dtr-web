import type { Metadata } from 'next'
import MarkdownContents from '@/components/shared/MarkdownContents'
import { readMarkdownFile } from '@/utils/read-md'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | DTR',
  description: 'Find answers to the most frequently asked questions about DTR, our programs, and how to get involved.',
  alternates: { canonical: 'https://dtr.northwestern.edu/faq' },
}

export default async function Faq() {
  const faqContent = await readMarkdownFile('faq.md')
  return <MarkdownContents content={faqContent} />
}
