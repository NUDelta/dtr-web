import type { Metadata } from 'next'
import Link from 'next/link'
import annualLetters from '@/lib/annual-letters'

export const metadata: Metadata = {
  title: 'Annual Letters and Resources | DTR',
  description: 'Read the DTR annual letters and explore resources on mentoring and learning.',
  alternates: { canonical: 'https://dtr.northwestern.edu/letters' },
}

export default function Letters() {
  return (
    <div className="prose mx-auto max-w-4xl">
      <h1>Annual Letters & Resources</h1>
      {/* Annual Letters Placeholder */}
      <h2>Annual Letters</h2>
      <p>
        The DTR annual letter shares Haoqi’s reflections on mentoring and
        learning, and on DTR’s evolving culture and practice. It’s a personal
        letter to learners & educators everywhere.
      </p>
      <div className="space-y-6">
        {annualLetters.map(annualLetter => (
          <div key={annualLetter.name} className="mb-4">
            <ul>
              <li>
                <a
                  target="_blank"
                  rel="noreferrer noopener"
                  href={annualLetter.link}
                >
                  {annualLetter.name}
                </a>
                <br />
                {/* add links to each section of the annual letter */}
                {annualLetter.tableOfContents.map((section, index) => (
                  <span key={section.name}>
                    <Link
                      target="_blank"
                      rel="noreferrer noopener"
                      href={`${annualLetter.link}#page=${section.page}`}
                      className="bg-transparent!"
                      prefetch={false}
                    >
                      <span className="link link-underline link-underline-black">
                        {section.name}
                        {' '}
                      </span>
                    </Link>
                    {/* add a vertical bar to separate sections */}
                    {index < annualLetter.tableOfContents.length - 1 && (
                      <span className="text-slate-300">| </span>
                    )}
                  </span>
                ))}
              </li>
            </ul>
          </div>
        ))}
      </div>
      {/*  Resources  */}
      <h2>Film, Paper, and Learning Resources</h2>
      <p>
        To learn more about our way of mentoring and learning, see:
      </p>
      <ul>
        <li>
          <Link
            target="_blank"
            rel="noreferrer noopener"
            href="http://forward.movie/"
            prefetch={false}
          >
            Forward: The DTR Documentary
          </Link>
        </li>
        <li>
          <Link
            target="_blank"
            rel="noreferrer noopener"
            href="https://nudelta.github.io/ARSweb/docs/ars-cscw2017.pdf"
          >
            The Agile Research Studios Paper
          </Link>
        </li>
        <li>
          <Link
            target="_blank"
            rel="noreferrer noopener"
            href="http://agileresearch.io/"
            prefetch={false}
          >
            Agile Research University
          </Link>
        </li>
      </ul>
    </div>
  )
}
