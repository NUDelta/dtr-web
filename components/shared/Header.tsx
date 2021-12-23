import Link from "next/link";
import Container from "./Container";
import { useRouter } from "next/router";

const links: { href: string; label: string }[] = [
  { href: "/", label: "Vision" },
  { href: "/method", label: "Method" },
  { href: "/howwework", label: "How We Work" },
  { href: "/people", label: "People" },
  { href: "/projects", label: "Projects" },
  { href: "/apply", label: "Apply" },
  { href: "/faq", label: "FAQ" },
];

export default function Header(): JSX.Element {
  const router = useRouter();

  return (
    <header className="bg-black text-white">
      <Container className="flex py-2 gap-6 items-center max-w-6xl">
        <Link href="/">
          <a className="font-semibold text-4xl">DTR</a>
        </Link>

        <nav className="flex space-x-4 items-center">
          {links.map(({ href, label }) => (
            <Link href={href} key={label}>
              <a
                className={`py-3 px-3 hover:bg-yellow hover:text-black transition-colors ${
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
