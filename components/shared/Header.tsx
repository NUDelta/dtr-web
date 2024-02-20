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
      <Container className="flex justify-between md:justify-start py-2 gap-6 items-center max-w-6xl">
        <Link href="/" className="font-semibold text-4xl block">
          DTR
        </Link>

        <button
          className="border rounded px-4 py-2 border-opacity-50 md:hidden"
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
    <nav className={`flex flex-col md:flex-row md:space-x-4 md:items-center`}>
      {links.map(({ href, label }) => (
        (<Link
          href={href}
          key={label}
          className={`py-3 px-3 hover:bg-yellow hover:text-black transition-colors ${
            router.pathname === href ? "bg-yellow text-black" : ""
          }`}>

          {label}

        </Link>)
      ))}
    </nav>
  );
}
