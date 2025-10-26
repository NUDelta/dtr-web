import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { GROUPS, ROOT_LINKS } from './items'
import renderIcon from './renderIcon'

interface DesktopNavProps {
  openGroup: string | null
  setOpenGroup: (id: string | null) => void
  openWithIntent: (id: string) => void
  closeWithIntent: (id: string) => void
  isActive: (href: string) => boolean
  className?: string
}

const DesktopNav = ({
  openGroup,
  setOpenGroup,
  openWithIntent,
  closeWithIntent,
  isActive,
  className = '',
}: DesktopNavProps) => {
  const navItemBase
    = 'px-3 py-2 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow hover:bg-yellow hover:text-black motion-reduce:transition-none'

  // --- Consistent, global dropdown alignment ---
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>())
  const [menuGlobalAlign, setMenuGlobalAlign] = useState<'left' | 'right'>('left')

  useEffect(() => {
    const compute = () => {
      const triggers = Array.from(triggerRefs.current.values())
      if (!triggers.length) {
        return
      }
      // Use the rightmost trigger to test potential overflow with fallback menu width
      const rightmost = triggers.reduce((a, b) =>
        a.getBoundingClientRect().left > b.getBoundingClientRect().left ? a : b,
      )
      const fallbackWidth = 224 // min-w-56
      const rect = rightmost.getBoundingClientRect()
      const viewportW = window.innerWidth
      const padding = 8
      const wouldOverflowRight = rect.left + fallbackWidth > viewportW - padding
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setMenuGlobalAlign(wouldOverflowRight ? 'right' : 'left')
    }

    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])

  return (
    <nav className={className} aria-label="Primary">
      <div className="flex items-center gap-1 md:text-sm lg:text-base">
        {/* Root links */}
        {ROOT_LINKS.map(l => (
          <a
            key={l.href}
            href={l.href}
            className={`${navItemBase} ${isActive(l.href) ? 'bg-yellow text-black' : ''}`}
            aria-current={isActive(l.href) ? 'page' : undefined}
          >
            <span className="flex items-center gap-2">
              {renderIcon(l.href)}
              <span>{l.label}</span>
            </span>
          </a>
        ))}

        {/* Dropdown groups */}
        {GROUPS.map((group) => {
          const groupActive = group.items.some(it => isActive(it.href))
          const open = openGroup === group.id

          return (
            <div
              key={group.id}
              className="relative"
              onMouseEnter={() => openWithIntent(group.id)}
              onMouseLeave={() => closeWithIntent(group.id)}
            >
              {/* Single interactive surface for label + chevron (fix hover split) */}
              <button
                ref={(el) => {
                  if (el) {
                    triggerRefs.current.set(group.id, el)
                  }
                }}
                type="button"
                className={`${navItemBase} flex items-center gap-1 ${
                  open || groupActive ? 'bg-yellow text-black' : ''
                }`}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={`menu-${group.id}`}
                onClick={() => setOpenGroup(open ? null : group.id)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setOpenGroup(group.id)
                    const first = document.querySelector<HTMLAnchorElement>(
                      `#menu-${group.id} a[role="menuitem"]`,
                    )
                    first?.focus()
                  }
                }}
              >
                <span>{group.label}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown with global alignment + viewport clamp */}
              <ul
                id={`menu-${group.id}`}
                role="menu"
                className={`absolute ${menuGlobalAlign === 'right' ? 'right-0' : 'left-0'} mt-2 w-max min-w-56 max-w-[calc(100vw-1rem)]
                  rounded-2xl border border-white/10 bg-black/95 shadow-2xl ring-1 ring-white/10 backdrop-blur p-2
                  transition-all origin-top ${
            open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'
            }`}
              >
                {group.items.map(item => (
                  <li key={item.href} role="none">
                    <a
                      href={item.href}
                      role="menuitem"
                      className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-yellow hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow ${
                        isActive(item.href) ? 'bg-yellow text-black' : ''
                      }`}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                      onClick={() => setOpenGroup(null)}
                    >
                      {renderIcon(item.href)}
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </nav>
  )
}

export default DesktopNav
