import { mockActiveBids } from "@/lib/mock-data";
import Link from "next/link";
import CollectorShell from "@/components/layout/CollectorShell";

const STATS = [
  { icon: "gavel", label: "Active Bids", value: "4", color: "primary-fixed-dim" },
  { icon: "emoji_events", label: "Items Won", value: "12", color: "tertiary-fixed-dim" },
  { icon: "payments", label: "Total Spent", value: "$1.2M", color: "secondary-fixed-dim" },
  { icon: "visibility", label: "Watchlist", value: "8", color: "outline-variant" },
];

export default function DashboardPage() {
  return (
    <CollectorShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        {/* Header */}
        <section>
          <div className="mb-md flex justify-between items-end">
            <div>
              <h2 className="font-display-lg-mobile md:font-display-lg text-primary">Dashboard</h2>
              <p className="font-body-lg text-on-surface-variant mt-xs">
                Welcome back, Mr. Sterling. Here is your auction overview.
              </p>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color} rounded-bl-full opacity-20 -mr-4 -mt-4`}
                />
                <div className="flex items-center gap-sm mb-sm text-on-surface-variant">
                  <span className="material-symbols-outlined">{stat.icon}</span>
                  <span className="font-label-md text-label-md">{stat.label}</span>
                </div>
                <div className="font-headline-md text-headline-md md:text-[32px] md:leading-[40px] font-bold text-primary">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-lg">
          {/* Active Bids Table */}
          <section className="xl:col-span-2 space-y-md">
            <h3 className="font-headline-sm text-headline-sm text-primary border-b border-surface-variant pb-xs">
              My Active Bids
            </h3>
            <div className="bg-surface rounded-xl soft-shadow border border-surface-variant overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-surface-variant">
                      {["Lot / Item", "Current Bid", "Time Left", "Status", ""].map((h) => (
                        <th key={h} className="p-md font-label-sm text-label-sm text-on-surface-variant">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockActiveBids.map((bid) => (
                      <tr
                        key={bid.id}
                        className={`border-b border-surface-variant hover:bg-surface-container-lowest transition-colors ${
                          bid.status === "outbid" ? "bg-error-container/10" : ""
                        }`}
                      >
                        <td className="p-md">
                          <div className="flex items-center gap-sm">
                            <div className="w-12 h-12 rounded bg-surface-variant overflow-hidden shrink-0">
                              <img src={bid.image} alt={bid.title} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-label-md text-label-md text-primary">Lot #{bid.lotNumber}</p>
                              <p className="font-body-md text-sm text-on-surface-variant truncate w-40">{bid.title}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-md font-headline-sm text-[16px] font-bold text-primary">
                          ${bid.currentBid.toLocaleString()}
                        </td>
                        <td
                          className={`p-md font-body-md text-sm ${
                            bid.status === "outbid" ? "text-error font-bold" : "text-on-surface-variant"
                          }`}
                        >
                          {bid.timeLeft}
                        </td>
                        <td className="p-md">
                          {bid.status === "leading" ? (
                            <span className="inline-flex items-center gap-1 bg-tertiary-fixed text-on-tertiary-fixed-variant px-2 py-1 rounded-full font-label-sm text-[10px]">
                              <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse" />
                              Leading
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-error-container text-on-error-container px-2 py-1 rounded-full font-label-sm text-[10px]">
                              <span className="material-symbols-outlined text-[12px]">warning</span>
                              Outbid
                            </span>
                          )}
                        </td>
                        <td className="p-md text-right">
                          {bid.status === "leading" ? (
                            <Link
                              href={`/auctions/${bid.id}`}
                              className="font-label-sm text-label-sm text-secondary hover:text-secondary-fixed-dim transition-colors"
                            >
                              View Live
                            </Link>
                          ) : (
                            <Link
                              href={`/auctions/${bid.id}`}
                              className="bg-secondary text-on-secondary font-label-sm text-[12px] px-3 py-1.5 rounded hover:bg-secondary-fixed-dim transition-colors glow-accent"
                            >
                              Bid Higher
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Right: Alerts + Quick Deposit */}
          <section className="space-y-md">
            <div className="glass-panel border border-error-container rounded-xl p-md relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-error" />
              <div className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-error mt-1">timer</span>
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface font-bold">Action Required</h4>
                  <p className="font-body-md text-sm text-on-surface-variant mt-1">
                    You have been outbid on Lot #18. Auction ends in 5 minutes.
                  </p>
                  <Link href="/auctions/2" className="mt-sm text-secondary font-label-sm text-label-sm hover:underline inline-block">
                    Review Lot
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-primary-container text-on-primary-container rounded-xl p-md soft-shadow">
              <h3 className="font-headline-sm text-headline-sm text-on-primary mb-sm">Quick Deposit</h3>
              <p className="font-body-md text-sm mb-md opacity-80">Ensure sufficient funds for upcoming bids.</p>
              <div className="flex gap-2 mb-md">
                {["$10k", "$50k", "$100k"].map((amt) => (
                  <button
                    key={amt}
                    className="flex-1 border border-outline-variant rounded py-1 font-label-sm text-on-primary hover:bg-on-primary/10 transition-colors"
                  >
                    {amt}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Custom Amount"
                  className="w-full bg-transparent border border-outline-variant rounded p-2 text-on-primary font-body-md focus:border-secondary focus:ring-1 focus:ring-secondary transition-all outline-none"
                />
                <span className="absolute right-3 top-2.5 text-outline-variant">$</span>
              </div>
              <button className="w-full bg-secondary text-on-secondary font-label-md py-2 rounded mt-md hover:bg-secondary-fixed-dim transition-colors glow-accent">
                Authorize Deposit
              </button>
            </div>
          </section>
        </div>

        {/* Recent Acquisitions */}
        <section className="pt-lg border-t border-surface-variant">
          <h3 className="font-headline-sm text-headline-sm text-primary mb-md">Recent Acquisitions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            {[
              {
                src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBE0Zs9QPyF2rkU6JjnmjIlk4-Z5H1zxXNUZygFt-j0A0hGLM71G0g8mNSief6Mr_64bsBLPfQy26IiQclTst8XDVnogBLwXJT4xNqlnuEPTLzATqrf1paPI6ZBACFrvgomIxwdHLqv8jOzyrSqehLiiGqNa-m2z9utaDdSULQsrMBe3LHH44J4BaIdx37fsQ026lBeorQ0HQFmzsZsThQiiN4wW2qdYj_HaNAvsOSMnkng1v3AqlfiJqS9psd_4LpnVvKD27Tlp5Z2",
                lot: "Lot #05",
                title: "Bronze Figure",
              },
              {
                src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDiT6gUkAiEERIx4SsHiJD_-EqZYjRVfIb7Ww2eTZwJLXaLJcvgzE_73wUmxloSiLQ7heBbWWpnQUBeXJdDE_SSmiNWQ3SRVFV_lMU-QBz-JDYKe5DVpN7_n1JluxjNfBmADpcMWLz5NSi5gtqVVT_vLyZKswfO4VxoIBz_MmoL_enH3iE2srXTF3DaiosPsRxeA0SZKOAKqmkVXebwiwg-wMzSA4dtUFWr1HNeVRvucRwAcX1QFz0HIHO0RFrwr5ZbXrP79Q3QZass",
                lot: "Lot #88",
                title: "Eames Lounge",
              },
            ].map((item) => (
              <div key={item.lot} className="group relative rounded-lg overflow-hidden soft-shadow aspect-square bg-surface-variant">
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-md">
                  <div className="text-white">
                    <p className="font-label-sm text-label-sm opacity-80">{item.lot}</p>
                    <p className="font-headline-sm text-sm font-bold">{item.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </CollectorShell>
  );
}
