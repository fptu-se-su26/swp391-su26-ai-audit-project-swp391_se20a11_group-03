import Link from "next/link";
import BrandLogo from "@/components/ui/BrandLogo";

const columns = [
  ["Discover", ["Live Auctions", "Upcoming", "Results", "Private Sales"]],
  ["Services", ["Sell with us", "Valuations", "Shipping", "Buyer protection"]],
  ["About", ["Our specialists", "Trust & safety", "Editorial", "Contact"]],
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050504] px-4 py-14 text-white sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[1.2fr_1.8fr]">
        <div>
          <BrandLogo inverted />
          <p className="mt-5 max-w-sm text-sm leading-6 text-[#9d948a]">
            A trusted global marketplace for authenticated luxury objects and exceptional collectibles.
          </p>
          <div className="mt-7 flex gap-2">
            {["language", "photo_camera", "alternate_email"].map((icon) => (
              <button key={icon} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[#9d948a] transition hover:border-[#d4aa61]/50 hover:text-[#efcf88]">
                <span className="material-symbols-outlined text-[17px]">{icon}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map(([heading, links]) => (
            <div key={heading as string}>
              <h3 className="text-[10px] font-bold uppercase tracking-[.2em] text-[#d4aa61]">{heading}</h3>
              <ul className="mt-5 space-y-3">
                {(links as string[]).map((label) => (
                  <li key={label}>
                    <Link href="#" className="text-sm text-[#9d948a] transition hover:text-[#d4aa61]">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-[1440px] flex-col gap-3 border-t border-white/10 pt-6 text-[11px] text-[#756d64] sm:flex-row sm:justify-between">
        <p>© 2026 BidZone. All rights reserved.</p>
        <p>Secure payments · Global shipping · Expert authentication</p>
      </div>
    </footer>
  );
}
