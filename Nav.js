"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/medical", label: "Medical AI" },
  { href: "/therapist", label: "Therapist AI" },
  { href: "/clinics", label: "Find Clinics" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="shell">
        <Link href="/" className="logo">
          <span className="dot" aria-hidden="true" />
          HealthPal
        </Link>
        <nav className="nav-links">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "active" : ""}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
