import React from "react";
import Link from "next/link";
import Container from "./Container";
import { useRouter } from "next/router";

const links: { href: string; label: string }[] = [
  { href: "/", label: "Vision" },
  { href: "/method", label: "Method" },
  { href: "/HowWeWork", label: "How We Work" },
  { href: "/People", label: "People" },
  { href: "/Projects", label: "Projects" },
  { href: "/Apply", label: "Apply" },
  { href: "/Faq", label: "FAQ" },
];

export default function Header(): JSX.Element {
  const router = useRouter();

  return (
    <header className="bg-black text-white">
      <Container className="flex py-2 gap-4 items-center">
        <Link href="/">
          <a className="font-semibold text-4xl">DTR</a>
        </Link>

        <nav className="flex space-x-4 items-center">
          {links.map(({ href, label }) => (
            <Link href={href} key={label}>
              <a
                className={`py-3 px-3 ${
                  router.pathname === href ? "bg-yellow text-black" : ""
                }`}
              >
                {label}
              </a>
            </Link>
          ))}
        </nav>
      </Container>
    </header>
  );
}
