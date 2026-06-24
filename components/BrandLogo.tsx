import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";

type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Knowledge Exchange">
      <LogoMark
        idPrefix="nav-logo"
        className="size-9 rounded-lg"
        title="Knowledge Exchange"
        size={36}
      />
      {!compact ? (
        <span className="leading-tight">
          <span className="block text-sm font-semibold text-white">Knowledge</span>
          <span className="block bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan bg-clip-text text-sm font-semibold text-transparent">
            Exchange
          </span>
        </span>
      ) : null}
    </Link>
  );
}
