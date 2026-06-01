const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/dtr_deltalab/',
  },
  {
    label: 'Twitter/X',
    href: 'https://x.com/DTR_DeltaLab',
  },
] as const

export default function Footer() {
  return (
    <footer className="mt-auto bg-white px-4 py-6 text-black">
      <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-center text-sm text-black/55">
        <p>
          © DTR - Northwestern University
        </p>

        <nav aria-label="Social links">
          <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            {socialLinks.map(({ label, href }, index) => (
              <li key={href}>
                {index > 0 && (
                  <span aria-hidden="true" className="mr-3 text-black/30">
                    ·
                  </span>
                )}
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit DTR on ${label}, opens in a new tab`}
                  className="rounded-sm px-1 py-0.5 text-black/65 underline-offset-4 transition-colors hover:text-black hover:underline focus:outline-none focus-visible:bg-yellow focus-visible:text-black focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                >
                  <span>{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
