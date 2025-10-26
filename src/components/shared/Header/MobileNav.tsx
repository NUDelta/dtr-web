import { GROUPS, ROOT_LINKS } from './items'
import renderIcon from './renderIcon'

interface MobileNavProps {
  isOpen: boolean
  close: () => void
  isActive: (href: string) => boolean
  id: string
  className?: string
}

const MobileNav = ({
  isOpen,
  close,
  isActive,
  id,
  className = '',
}: MobileNavProps) => {
  // Grouped, non-collapsible mobile nav
  // People & Projects are simple top-level links (no section header)
  const SECTIONS = GROUPS.map(g => ({ id: g.id, label: g.label, items: g.items }))

  return (
    <div
      id={id}
      className={`${className} absolute left-0 top-full z-40 w-full bg-black text-white shadow-lg transition-all duration-200 ease-out ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
      aria-hidden={!isOpen}
    >
      <nav aria-label="Mobile" className="p-2">
        {/* Top-level links first */}
        <ul className="mb-2">
          {ROOT_LINKS.map(item => (
            <li key={item.href} className="border-b border-white/10 last:border-none">
              <a
                href={item.href}
                className={`flex items-center gap-2 rounded-md px-4 py-3 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow hover:bg-yellow hover:text-black ${
                  isActive(item.href) ? 'bg-yellow text-black' : ''
                }`}
                aria-current={isActive(item.href) ? 'page' : undefined}
                onClick={close}
              >
                {renderIcon(item.href)}
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>

        {/* Grouped secondary sections with headers */}
        {SECTIONS.map(section => (
          <div key={section.id} role="group" aria-labelledby={`m-${section.id}`} className="pb-1">
            <h2
              id={`m-${section.id}`}
              className="px-4 pt-3 pb-1 text-xs font-medium uppercase tracking-wider text-white/50"
            >
              {section.label}
            </h2>
            <ul>
              {section.items.map(item => (
                <li key={item.href} className="border-b border-white/10 last:border-none">
                  <a
                    href={item.href}
                    className={`flex items-center gap-2 rounded-md px-6 py-3 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow hover:bg-yellow hover:text-black ${
                      isActive(item.href) ? 'bg-yellow text-black' : ''
                    }`}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    onClick={close}
                  >
                    {renderIcon(item.href)}
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  )
}

export default MobileNav
