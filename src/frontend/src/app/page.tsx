import Link from "next/link";
import TopNav from "@/components/layout/TopNav";
import { mockStorefrontLots } from "@/lib/mock-data";

export default function HomePage() {
  const featuredLots = mockStorefrontLots.slice(0, 4);

  return (
    <main className="min-h-screen bg-surface-container-lowest text-on-surface">
      <TopNav />

      <section className="relative overflow-hidden bg-primary-container text-on-primary-container">
        <div className="absolute inset-0">
          <img
            src={featuredLots[0].image}
            alt={featuredLots[0].title}
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-primary-container/80" />
        </div>

        <div className="relative mx-auto grid min-h-[520px] max-w-screen-2xl items-center gap-xl px-margin-mobile py-2xl md:grid-cols-[1.1fr_0.9fr] md:px-margin-desktop">
          <div className="max-w-3xl">
            <p className="mb-sm font-label-md text-label-md uppercase tracking-widest text-secondary-fixed-dim">
              Curated luxury auctions
            </p>
            <h1 className="mb-md font-display-lg text-display-lg text-white">
              LuxeAuction
            </h1>
            <p className="mb-lg max-w-2xl font-body-lg text-body-lg text-white/80">
              Discover authenticated watches, art, design objects, and rare collectibles from a marketplace built for serious collectors.
            </p>
            <div className="flex flex-wrap gap-sm">
              <Link
                href="/storefront"
                className="rounded-lg bg-secondary px-6 py-3 font-label-md text-label-md text-on-secondary shadow-sm transition-opacity hover:opacity-90"
              >
                Browse Live Lots
              </Link>
              <Link
                href="/auth"
                className="rounded-lg border border-white/40 px-6 py-3 font-label-md text-label-md text-white transition-colors hover:bg-white/10"
              >
                Sign In to Bid
              </Link>
            </div>
          </div>

          <div className="hidden rounded-lg border border-white/20 bg-white/10 p-sm shadow-xl backdrop-blur md:block">
            <img
              src={featuredLots[0].image}
              alt={featuredLots[0].title}
              className="aspect-[4/3] w-full rounded-md object-cover"
            />
            <div className="mt-sm flex items-center justify-between text-white">
              <div>
                <p className="font-label-sm text-label-sm text-white/60">Featured Lot #{featuredLots[0].lotNumber}</p>
                <h2 className="font-headline-sm text-headline-sm">{featuredLots[0].title}</h2>
              </div>
              <div className="text-right">
                <p className="font-label-sm text-label-sm text-white/60">Current Bid</p>
                <p className="font-headline-sm text-headline-sm">${featuredLots[0].currentBid.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-2xl px-margin-mobile py-xl md:px-margin-desktop">
        <div className="mb-lg flex flex-col gap-xs md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-label-md text-label-md uppercase tracking-widest text-secondary">Live now</p>
            <h2 className="font-headline-lg text-headline-lg text-primary">Public Storefront</h2>
          </div>
          <Link href="/storefront" className="font-label-md text-label-md text-secondary hover:underline">
            View full catalogue
          </Link>
        </div>

        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
          {featuredLots.map((lot) => (
            <article key={lot.id} className="overflow-hidden rounded-lg border border-outline-variant bg-surface shadow-sm">
              <img src={lot.image} alt={lot.title} className="aspect-[4/3] w-full object-cover" />
              <div className="p-md">
                <div className="mb-xs flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-outline">Lot #{lot.lotNumber}</span>
                  {lot.isLive && (
                    <span className="rounded-full bg-error-container px-2 py-1 font-label-sm text-[10px] uppercase tracking-wide text-error">
                      Live
                    </span>
                  )}
                </div>
                <h3 className="min-h-12 font-headline-sm text-headline-sm text-primary">{lot.title}</h3>
                <div className="mt-sm flex items-center justify-between">
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Current bid</p>
                    <p className="font-label-lg text-label-lg text-on-surface">${lot.currentBid.toLocaleString()}</p>
                  </div>
                  <p className="font-label-md text-label-md text-secondary">{lot.timeLeft}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
