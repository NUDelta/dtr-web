'use client'

import { useClickOutside, useSessionStorage } from '@zl-asica/react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

interface Announcement {
  id: string
  title?: string
  description?: string
  image?: string
  link?: { url: string, text: string }
  expiryDate: string // YYYY-MM-DD format
}

const announcements: Announcement[] = [
  {
    id: 'dtr-s25-open-house',
    title: 'DTR Open House',
    image: '/images/DTR-S25-OpenHouse.webp',
    link: {
      url: 'https://docs.google.com/forms/d/e/1FAIpQLScY1e_ho8krNwimg3wWTiFNHMzF8e-fSTFhI8xEEzEdk4-yQA/viewform',
      text: 'RSVP',
    },
    expiryDate: '2025-05-09',
  },
]

// local YYYY-MM-DD
const fmtLocalDate = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const PopupAnnouncement = () => {
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [today, setToday] = useState<string | null>(null)

  const ref = useRef<HTMLDivElement>(null)
  const { value: lastViewedDate, setValue: setLastViewedDate }
    = useSessionStorage<string>('viewed-announcement-date', '')

  // Close on outside click
  useClickOutside(ref, () => setIsVisible(false))

  // Compute "today" on the client after hydration
  useEffect(() => {
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setToday(fmtLocalDate(new Date()))
  }, [])

  // Decide whether to show an announcement (runs only after "today" is set)
  useEffect(() => {
    if (today === null) {
      return
    }
    // already shown today
    if (lastViewedDate === today) {
      return
    }

    // Compare as ISO-like strings
    const valid = announcements.filter(a => a.expiryDate >= today)

    if (valid.length > 0) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setActiveAnnouncement(valid[0])
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setIsVisible(true)
      setLastViewedDate(today)
    }
  }, [lastViewedDate, today, setLastViewedDate])

  if (!isVisible || !activeAnnouncement) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/50 px-4 pt-16 pb-4"
      aria-hidden={!isVisible}
    >
      <div
        ref={ref}
        // prevent inside clicks from closing (outside clicks handled by hook)
        onClick={e => e.stopPropagation()}
        className="pointer-events-auto inline-flex max-h-[90vh] max-w-[90vw] w-auto flex-col overflow-hidden rounded-3xl bg-white p-4 text-center shadow-2xl md:p-6"
        role="dialog"
        aria-modal
        aria-labelledby="announcement-title"
        aria-describedby="announcement-description"
      >
        {activeAnnouncement.image !== undefined && (
          <Image
            src={activeAnnouncement.image}
            alt={activeAnnouncement.title ?? 'Announcement'}
            width={500}
            height={1500}
            className="flex max-h-[50vh] w-auto justify-center rounded-xl object-contain md:max-h-[60vh] lg:max-h-[70vh]"
            priority
          />
        )}

        <div className="flex grow max-w-full flex-col items-center px-4 pt-2 md:pt-6">
          {activeAnnouncement.title !== undefined && (
            <h2
              id="announcement-title"
              className="text-lg font-bold text-gray-900 md:text-xl lg:text-2xl md:font-extrabold"
            >
              {activeAnnouncement.title}
            </h2>
          )}
          {activeAnnouncement.description !== undefined && (
            <p id="announcement-description" className="mt-2 text-gray-600">
              {activeAnnouncement.description}
            </p>
          )}
        </div>

        <div className="w-full justify-center gap-4 pt-2 pb-1 sm:gap-8 md:gap-10 md:pb-4 md:pt-4 lg:gap-12 flex">
          {activeAnnouncement.link !== undefined && (
            <a
              href={activeAnnouncement.link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-yellow px-4 py-1 font-semibold text-black shadow-md transition hover:scale-110 hover:bg-yellow-300 md:px-6 md:py-3"
            >
              {activeAnnouncement.link.text}
            </a>
          )}
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="rounded-full bg-gray-300 px-4 py-1 font-bold text-gray-800 shadow-md transition hover:scale-110 hover:bg-gray-400 md:px-6 md:py-3"
            aria-label="Close announcement popup"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

export default PopupAnnouncement
