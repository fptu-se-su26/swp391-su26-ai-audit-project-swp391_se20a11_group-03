import Link from "next/link";
import BidZoneLogo from "@/components/brand/BidZoneLogo";
import { NAV_LINKS } from "@/lib/home-data";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-md">
      <div className="flex min-h-16 w-full items-center justify-between gap-3 px-4 py-3 sm:min-h-20 sm:px-6 lg:px-12">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label="BidZone"
        >
          <BidZoneLogo priority className="h-12 w-auto sm:h-14" />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-14 text-xs font-medium tracking-widest text-white/80 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-[#f0c982]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/auth"
            className="hidden rounded-full border border-[#d7aa63]/50 px-4 py-2.5 text-xs font-semibold tracking-wider text-white transition-colors hover:bg-white/10 md:inline-block"
          >
            ĐĂNG NHẬP
          </Link>
          <Link
            href="/auth"
            className="rounded-full bg-[#f0c982] px-4 py-2.5 text-xs font-semibold tracking-wider text-black transition-colors hover:bg-[#f4d79b] sm:px-5"
          >
            ĐĂNG KÝ
          </Link>
        </div>
      </div>
    </header>
  );
}
