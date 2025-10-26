import type { Metadata } from 'next'
import { quoteChunks } from '@/components/what-we-learn'

export const metadata: Metadata = {
  title: 'What We Learn | DTR',
  alternates: { canonical: 'https://dtr.northwestern.edu/what-we-learn' },
}

export default function WhatWeLearn() {
  return (
    <div className="prose mx-auto max-w-4xl">
      <h1 className="text-3xl font-semibold">
        What Students Get Out of DTR
      </h1>
      <p className="mb-6">
        In 2021 we sought out letters from DTR students and alums, asking
        them to share what they got from their DTR experience. We received
        about 30 letters, and the students’ words provide a much better
        picture of DTR than our website did. We share some excerpts from
        these letters below.
      </p>

      {/* Quote Placeholder */}
      <div className="space-y-6">
        {quoteChunks.map(chunk => (
          <div key={chunk.descriptor} className="mb-6">
            <h2 className="mb-4 border-b border-black text-2xl font-semibold">
              {chunk.descriptor}
            </h2>
            {/* <div className="text-lg font-bold">{ chunk.descriptor }</div> */}
            <div className="mt-4">
              {chunk.quotes.map(quote => (
                <div key={quote.text} className="mb-4 pl-10 pr-10">
                  {quote.text}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 mt-6">
        In these ways, DTR provides a spectacular learning space for
        students. We will work hard to keep it that way. As long as DTR
        continues to do right by students, we will do just fine.
      </div>
    </div>
  )
}
