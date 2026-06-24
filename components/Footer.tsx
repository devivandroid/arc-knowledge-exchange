import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

const footerLinks = [
  { label: "Marketplace", href: "/marketplace", external: false },
  { label: "Requests", href: "/requests", external: false },
  { label: "Risk API", href: "/reputation", external: false },
  { label: "Agent API", href: "/agent-api", external: false },
  {
    label: "GitHub",
    href: "https://github.com/devivandroid/arc-knowledge-exchange",
    external: true
  },
  { label: "X", href: "https://x.com", external: true }
];

export function Footer() {
  return (
    <footer className="border-t border-arc-border/80">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <BrandLogo />
          <p>USDC-native knowledge commerce on Arc Testnet</p>
        </div>
        <div className="flex gap-5">
          {footerLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-arc-blue"
              >
                {link.label}
              </a>
            ) : (
              <Link key={link.label} href={link.href} className="transition hover:text-arc-blue">
                {link.label}
              </Link>
            )
          )}
        </div>
      </div>
    </footer>
  );
}
