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
  return (
    <div className="mx-auto max-w-4xl">
      <MarkdownContents content={applyContent} />
      <a
        href="https://docs.google.com/forms/d/12PJFFoPrk6CzopB0mAm2Go3eLFBzNMMmwjDtCNAdKEc/viewform"
        target="_blank"
        rel="noreferrer noopener"
        className="unstyled-link mt-6 inline-block rounded-lg border-2 bg-yellow py-2 px-6 text-lg font-semibold transition hover:bg-yellow-500"
      >
        {' '}
        Apply Now
      </a>
    </div>
  )
}
