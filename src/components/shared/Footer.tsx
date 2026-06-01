import { Camera, X } from 'lucide-react'

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/dtr_deltalab/',
    icon: Camera,
  },
  {
    label: 'X/Twitter',
    href: 'https://x.com/DTR_DeltaLab',
    icon: X,
  },
] as const

const currentYear = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-black/10 bg-white px-4 py-8 text-black">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-lg font-semibold">DTR</p>
          <p className="text-sm text-black/65">
            {`Copyright ${currentYear} Design, Technology, and Research. All rights reserved.`}
          </p>
        </div>

        <nav aria-label="Social links">
          <ul className="flex items-center gap-3">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit DTR on ${label}`}
                  className="inline-flex size-11 items-center justify-center rounded-md border border-black/15 text-black transition-colors hover:border-black hover:bg-yellow focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2"
                >
                  <Icon size={20} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
