'use client';

import { useClickOutside, useSessionStorage, useToggle } from '@zl-asica/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

interface Announcement {
  id: string;
  title?: string;
  description?: string;
  image?: string;
  link?: { url: string; text: string };
  expiryDate: string; // YYYY-MM-DD format
}

const announcements: Announcement[] = [
  {
    id: 'dtr-w25-open-house',
    title: 'DTR Open House',
    image: '/images/DTR-W25-Poster.webp',
    link: {
      url: 'https://docs.google.com/forms/d/1PA-wRTvB3OecHlX2PUuNOYRTd6GRP_fBEz6s3qhMZSE',
      text: 'RSVP',
    },
    expiryDate: '2025-02-14',
  },
];

const PopupAnnouncement = () => {
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, toggleIsVisible] = useToggle();
  const {
    value: lastViewedDate,
    setValue: setLastViewedDate,
  } = useSessionStorage<string>('viewed-announcement-date', '');

  useClickOutside(ref, toggleIsVisible);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    if (lastViewedDate === today) {
      return; // User has already viewed today
    }

    const validAnnouncements = announcements.filter(a =>
      new Date(a.expiryDate) >= new Date(today));

    if (validAnnouncements.length > 0) {
      setActiveAnnouncement(validAnnouncements[0]);
      toggleIsVisible();
      setLastViewedDate(today); // Save current date
    }
  }, [lastViewedDate, today, setLastViewedDate, toggleIsVisible]);

  if (!isVisible || !activeAnnouncement) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md bg-black/50 px-4 pt-[4rem] pb-4 pointer-events-auto"
      onClick={(event_) => {
        event_.stopPropagation();
        event_.preventDefault();
      }}
      aria-hidden={!isVisible}
    >
      <div
        ref={ref}
        className="bg-white p-4 rounded-3xl shadow-2xl max-h-[90vh] max-w-[90vw] w-auto inline-flex flex-col text-center overflow-hidden md:p-6 pointer-events-auto"
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
            className="rounded-xl object-contain w-auto max-h-[50vh] flex justify-center md:max-h-[60vh] lg:max-h-[70vh]"
            priority
          />
        )}

        <div className="flex flex-col items-center px-4 pt-2 flex-grow justify-center max-w-full md:pt-6">
          <h2
            id="announcement-title"
            className="text-lg font-bold text-gray-900 md:text-xl lg:text-2xl md:font-extrabold"
          >
            {activeAnnouncement.title}
          </h2>
          <p
            id="announcement-description"
            className="text-gray-600 mt-2"
          >
            {activeAnnouncement.description}
          </p>
        </div>

        <div className="flex justify-center gap-4 pt-2 w-full pb-1 md:pb-4 md:pt-4 sm:gap-8 md:gap-10 lg:gap-12">
          {activeAnnouncement.link && (
            <Link
              href={activeAnnouncement.link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1 bg-[var(--color-yellow)] text-black rounded-full font-semibold shadow-md hover:bg-yellow-300 hover:scale-110 transition md:px-6 md:py-3"
            >
              {activeAnnouncement.link.text}
            </Link>
          )}
          <button
            type="button"
            onClick={toggleIsVisible}
            className="px-4 py-1 bg-gray-300 text-gray-800 rounded-full font-bold shadow-md hover:bg-gray-400 hover:scale-110 transition md:px-6 md:py-3"
            aria-label="Close announcement popup"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupAnnouncement;
