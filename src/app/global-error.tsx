'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    console.error(error)

    // Countdown
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    // Redirect after 10 seconds
    const redirectTimer = setTimeout(() => {
      // Redirect to home page
      globalThis.location.href = '/'
    }, 10_000)

    return () => {
      clearInterval(timer)
      clearTimeout(redirectTimer)
    }
  }, [error])

  return (
    <html lang="en">
      <body>
        <main className="mx-8 mt-[30vh] flex flex-col items-center justify-center text-center">
          <h1 className="mb-4 text-3xl font-bold text-red-400">
            Something went wrong
          </h1>

          <p className="mb-2 text-base leading-7">
            We hit an unexpected error. You’ll be redirected to the home page in
            {' '}
            <span className="font-bold">{countdown}</span>
            {' '}
            seconds.
          </p>

          {error?.message
            ? (
                <p className="mb-4 max-w-[60ch] text-sm text-neutral-500 wrap-break-word">
                  <span className="font-medium">Error:</span>
                  {' '}
                  {error.message}
                  {error.digest !== undefined
                    ? (
                        <>
                          {' '}
                          <span className="opacity-70">
                            (digest:
                            {error.digest}
                            )
                          </span>
                        </>
                      )
                    : null}
                </p>
              )
            : null}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="rounded bg-dark-yellow px-4 py-2 text-black no-underline transition-all duration-500 hover:scale-105 hover:bg-dark-yellow hover:text-black"
            >
              Back to Home
            </Link>

            <button
              type="button"
              onClick={() => globalThis.history.back()}
              className="cursor-pointer rounded bg-neutral-200 px-4 py-2 text-neutral-800 transition-all duration-500 hover:scale-105 hover:bg-neutral-300 hover:text-neutral-900"
            >
              Back to Previous Page
            </button>

            <button
              type="button"
              onClick={reset}
              className="cursor-pointer rounded bg-neutral-800 px-4 py-2 text-white transition-all duration-500 hover:scale-105 hover:bg-neutral-700"
            >
              Try Again
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
