'use client';

import { useClickOutside, useHideOnScrollDown } from '@zl-asica/react';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';
import Container from './Container';

const links: { href: string; label: string }[] = [
  { href: '/how-we-work', label: 'How We Work' },
  { href: '/what-we-learn', label: 'What We Learn' },
  { href: '/people', label: 'People' },
  { href: '/projects', label: 'Projects' },
  { href: '/apply', label: 'Apply' },
  { href: '/faq', label: 'FAQ' },
  { href: '/letters', label: 'Annual Letters and Resources' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderVisible = useHideOnScrollDown(headerRef, 50);

  // Listen for outside click to close the mobile menu
  useClickOutside(headerRef, () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  });

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 z-50 w-full bg-black text-white transition-transform duration-300 ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <Container className="flex max-w-6xl items-center justify-between gap-6 py-2 md:justify-start">
        <a
          href="/"
          className="block font-semibold md:text-3xl lg:text-4xl"
          onClick={() => {
            if (isMenuOpen) {
              setIsMenuOpen(false);
            }
          }}
        >
          DTR
        </a>

        {/* Mobile Menu Button */}
        <button
          className="rounded-sm border border-opacity-50 px-4 py-2 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          type="button"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? 'Close ✖' : 'Menu ☰'}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <Nav />
        </div>
      </Container>

      {/* Mobile Menu */}
      <div
        className={`absolute left-0 top-full z-40 w-full bg-black text-white shadow-lg transition-all duration-300 ease-out md:hidden ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        aria-hidden={!isMenuOpen}
      >
        <Nav isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      </div>
    </header>
  );
}

interface NavProps {
  isMenuOpen?: boolean;
  setIsMenuOpen?: (isOpen: boolean) => void;
}

function Nav({ isMenuOpen, setIsMenuOpen }: NavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col md:flex-row md:items-center md:space-x-4 md:text-sm lg:text-base p-6 md:p-0">
      {links.map(({ href, label }) => (
        <a
          href={href}
          key={label}
          onClick={() => {
            if (isMenuOpen && setIsMenuOpen) {
              setIsMenuOpen(false);
            }
          }}
          className={`px-3 py-3 transition-colors rounded-sm hover:bg-yellow hover:text-black ${
            pathname === href ? 'rounded-sm bg-yellow text-black' : ''
          }`}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
