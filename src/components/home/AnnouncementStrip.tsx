'use client'

import { useEffect, useState } from 'react'
import announcements, { fmtLocalDate } from '@/lib/announcements'

interface AnnouncementStripProps {
  className?: string
}

const AnnouncementStrip = ({ className }: AnnouncementStripProps) => {
  const announcement = announcements.find(a => a.summary !== undefined)
  const [expired, setExpired] = useState(false)

  // Check the date on the client so a page built before the expiry date still hides it
  useEffect(() => {
    if (announcement !== undefined) {
      // eslint-disable-next-line react/set-state-in-effect
      setExpired(announcement.expiryDate < fmtLocalDate(new Date()))
    }
  }, [announcement])

  if (announcement === undefined || expired) {
    return null
  }

  return (
    <div
      className={`flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-lg bg-black px-4 py-2 text-center text-white ${className}`}
    >
      <p>
        <span className="block font-bold sm:inline">{announcement.title}</span>
        <span className="mx-2 hidden text-white/50 sm:inline" aria-hidden>|</span>
        {/* keep each part (e.g. "2–3:30pm") on one line when the strip wraps */}
        {announcement.summary?.split(' · ').map((part, index) => (
          <span key={part}>
            {index > 0 && ' · '}
            <span className="whitespace-nowrap">{part}</span>
          </span>
        ))}
      </p>
      {announcement.link !== undefined && (
        <a
          href={announcement.link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-yellow px-4 py-0.5 font-semibold text-black transition hover:scale-105 hover:bg-yellow-300"
        >
          {announcement.link.text}
        </a>
      )}
    </div>
  )
}

export default AnnouncementStrip
