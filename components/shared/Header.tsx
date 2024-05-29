import Link from "next/link";
import Container from "./Container";
import { useRouter } from "next/router";
import { useState } from "react";

const links: { href: string; label: string }[] = [
  { href: "/how-we-work", label: "How We Work" },
  { href: "/what-we-learn", label: "What We Learn" },
  { href: "/people", label: "People" },
  { href: "/projects", label: "Projects" },
  { href: "/apply", label: "Apply" },
  { href: "/faq", label: "FAQ" },
  { href: "/letters", label: "Annual Letters and Resources" },
];

export default function Header(): JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-black text-white">
      <Container className="flex max-w-6xl items-center justify-between gap-6 py-2 md:justify-start">
        <Link href="/" className="block font-semibold md:text-3xl lg:text-4xl">
          DTR
        </Link>

        <button
          className="rounded border border-opacity-50 px-4 py-2 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          Menu
        </button>

        <div className="hidden md:block">
          <Nav />
        </div>
      </Container>

      {isMenuOpen && (
        <div className="px-4 py-8">
          <Nav />
        </div>
      )}
    </header>
  );
}

function Nav(): JSX.Element {
  const router = useRouter();

  return (
    <nav
      className={`flex flex-col md:flex-row md:items-center md:space-x-4 md:text-sm lg:text-base`}
    >
      {links.map(({ href, label }) => (
        <Link
          href={href}
          key={label}
          className={`px-3 py-3 transition-colors hover:bg-yellow hover:text-black ${
            router.pathname === href ? "bg-yellow text-black" : ""
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
