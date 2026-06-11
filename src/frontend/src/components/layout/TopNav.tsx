import Link from "next/link";

export default function TopNav() {
  return (
    <nav className="sticky top-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm">
      <div className="flex items-center justify-between px-margin-mobile md:px-margin-desktop h-20 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-headline-md text-headline-md font-bold tracking-tight text-primary">
            LuxeAuction
          </Link>
          <div className="hidden md:flex gap-6 items-center">
            <Link href="/storefront" className="font-label-md text-label-md text-secondary font-bold border-b-2 border-secondary pb-1">
              Live Auctions
            </Link>
            <a href="#" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-all">Upcoming</a>
            <a href="#" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-all">Results</a>
            <a href="#" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-all">Sell</a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-surface-container rounded-full px-4 py-2 border border-outline-variant/30 focus-within:border-primary transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
            <input
              type="text"
              placeholder="Search lots..."
              className="bg-transparent border-none outline-none font-body-md text-body-md w-48 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0 p-0"
            />
          </div>
          <button className="p-2 rounded-full hover:bg-surface-variant/50 transition-all text-on-surface-variant">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 rounded-full hover:bg-surface-variant/50 transition-all text-on-surface-variant">
            <span className="material-symbols-outlined">favorite</span>
          </button>
          <Link href="/dashboard">
            <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden ml-2 border border-outline-variant/20">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXE08jGkP0wNgxSrwHFZWZydXCEr9H3OPgDOTX3xLWjx71FcefCaM2oJQdiurNQR880o3M6HLg9n6Qt9QrgZl7vob-UtSMWZ-teOAwp0z6VJHeCy8UaGY6A3YnnQHrYlXDN_f7pPDTlNd8vO3fV_KqdmBR9GeE7YyGyYiPvV2n2QHwPML0aJMCikX_a34dz8VK0qaN5NVGLEBahKQqtgsLI35fDKD34AYJOB7wLZvtKxu6WlowY-IxHQOrXKrDuBUoTBefE8QRC8At"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
