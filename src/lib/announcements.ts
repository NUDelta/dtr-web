const announcements: Announcement[] = [
  {
    id: 'dtr-w27-open-house',
    title: 'DTR Open House',
    summary: 'Friday, Nov 6 · 2–3:30pm · The Garage',
    image: '/images/DTR-W27-OpenHouse.jpg',
    link: {
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSdTtZ-_-I2ZyoBUCbQCci6CxyN9YVeu52oIuhkwACHkQfPblg/viewform',
      text: 'RSVP',
    },
    expiryDate: '2026-11-07',
  },
]

// local YYYY-MM-DD
export const fmtLocalDate = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Compare as ISO-like strings
export const getActiveAnnouncements = (today: string) =>
  announcements.filter(a => a.expiryDate >= today)

export default announcements
