import Link from "next/link";
import BrandLogo from "@/components/ui/BrandLogo";

const columns = [
  ["Discover", ["Live Auctions", "Upcoming", "Results", "Private Sales"]],
  ["Services", ["Sell with us", "Valuations", "Shipping", "Buyer protection"]],
  ["About", ["Our specialists", "Trust & safety", "Editorial", "Contact"]],
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 px-4 py-14 text-white sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[1.2fr_1.8fr]">
        <div>
          <BrandLogo inverted />
          <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
            A trusted global marketplace for authenticated luxury objects and exceptional collectibles.
          </p>
          <div className="mt-7 flex gap-2">
            {["language", "photo_camera", "alternate_email"].map((icon) => (
              <button key={icon} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-slate-400 transition hover:border-[#d6a84f]/50 hover:text-[#f2d786]">
                <span className="material-symbols-outlined text-[17px]">{icon}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map(([heading, links]) => (
            <div key={heading as string}>
              <h3 className="text-[10px] font-bold uppercase tracking-[.2em] text-[#d8bd75]">{heading}</h3>
              <ul className="mt-5 space-y-3">
                {(links as string[]).map((label) => (
                  <li key={label}>
                    <Link href="#" className="text-sm text-slate-400 transition hover:text-white">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-[1440px] flex-col gap-3 border-t border-white/10 pt-6 text-[11px] text-slate-500 sm:flex-row sm:justify-between">
        <p>© 2026 BidZone. All rights reserved.</p>
        <p>Secure payments · Global shipping · Expert authentication</p>
      </div>
    </footer>
  );
}
