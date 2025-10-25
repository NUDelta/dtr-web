'use client'

import { useClickOutside, useHideOnScrollDown } from '@zl-asica/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Container from '@/components/shared/Container'
import DesktopNav from './DesktopNav'
import MobileNav from './MobileNav'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false) // mobile drawer
  const [openGroup, setOpenGroup] = useState<string | null>(null) // desktop dropdown id
  const headerRef = useRef<HTMLDivElement>(null)
  const isHeaderVisible = useHideOnScrollDown(headerRef, 50)
  const hoverTimer = useRef<number | null>(null)
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href)

  // Close on outside click
  useClickOutside(headerRef, () => {
    if (isMenuOpen) {
      setIsMenuOpen(false)
    }
    if (openGroup !== null) {
      setOpenGroup(null)
    }
  })

  // ESC closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenGroup(null)
        setIsMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const clearHoverTimer = () => {
    if (hoverTimer.current !== null) {
      window.clearTimeout(hoverTimer.current)
      hoverTimer.current = null
    }
  }

  const openWithIntent = (id: string) => {
    clearHoverTimer()
    hoverTimer.current = window.setTimeout(() => setOpenGroup(id), 80)
  }

  const closeWithIntent = (id: string) => {
    clearHoverTimer()
    hoverTimer.current = window.setTimeout(() => {
      setOpenGroup(g => (g === id ? null : g))
    }, 180)
  }

  return (
    <>
      {/* Skip link for screen readers */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-60 focus:rounded-md focus:bg-yellow focus:px-3 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>

      <header
        ref={headerRef}
        className={`fixed top-0 left-0 z-50 w-full bg-black/85 backdrop-blur supports-backdrop-filter:bg-black/75 text-white transition-transform duration-300 ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <Container className="flex max-w-6xl items-center justify-between gap-4 py-2 md:gap-6">
          <Link
            href="/"
            className="block font-semibold md:text-3xl lg:text-4xl focus:outline-none focus-visible:ring focus-visible:ring-yellow rounded-md"
            onClick={() => {
              setIsMenuOpen(false)
              setOpenGroup(null)
            }}
          >
            DTR
          </Link>

          {/* Mobile hamburger */}
          <button
            className="rounded-md border border-white/30 px-3 py-2 md:hidden focus:outline-none focus-visible:ring focus-visible:ring-yellow"
            onClick={() => setIsMenuOpen(v => !v)}
            type="button"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
          >
            {isMenuOpen ? 'Close ✖' : 'Menu ☰'}
          </button>

          {/* Desktop nav */}
          <DesktopNav
            openGroup={openGroup}
            setOpenGroup={setOpenGroup}
            openWithIntent={openWithIntent}
            closeWithIntent={closeWithIntent}
            isActive={isActive}
            className="hidden md:block"
          />
        </Container>

        {/* Mobile drawer (flat list; no folding) */}
        <MobileNav
          isOpen={isMenuOpen}
          close={() => setIsMenuOpen(false)}
          isActive={isActive}
          id="mobile-nav"
          className="md:hidden"
        />
      </header>
    </>
  )
}
