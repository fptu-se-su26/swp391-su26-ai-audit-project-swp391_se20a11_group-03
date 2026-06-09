import { mockInventory } from "@/lib/mock-data";
import Link from "next/link";
import CollectorShell from "@/components/layout/CollectorShell";

const STATUS_CONFIG = {
  live: { label: "Live", class: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
  pending: { label: "Pending", class: "bg-secondary-container text-on-secondary-container" },
  review: { label: "Under Review", class: "bg-primary-fixed text-on-primary-fixed-variant" },
};

export default function InventoryPage() {
  const stats = [
    { label: "Active Listings", value: "3", icon: "inventory_2" },
    { label: "Items Sold", value: "12", icon: "sell" },
    { label: "Total Revenue", value: "$1.85M", icon: "payments" },
    { label: "Avg. Sale Price", value: "$154K", icon: "trending_up" },
  ];

  return (
    <CollectorShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-display-lg-mobile md:font-display-lg text-primary">My Inventory</h1>
            <p className="font-body-lg text-on-surface-variant mt-xs">Manage your consignment portfolio.</p>
          </div>
          <Link
            href="/post-item"
            className="bg-secondary text-on-secondary font-label-md text-label-md px-md py-sm rounded-lg flex items-center gap-xs hover:bg-secondary-fixed-dim transition-colors glow-accent"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Post New Item
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          {stats.map((s) => (
            <div key={s.label} className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant">
              <div className="flex items-center gap-sm mb-sm text-on-surface-variant">
                <span className="material-symbols-outlined">{s.icon}</span>
                <span className="font-label-md text-label-md">{s.label}</span>
              </div>
              <p className="font-headline-md text-headline-md md:text-[28px] font-bold text-primary">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Items Grid */}
        <section>
          <h2 className="font-headline-sm text-headline-sm text-primary border-b border-surface-variant pb-xs mb-md">
            Current Listings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
            {mockInventory.map((item) => {
              const statusCfg = STATUS_CONFIG[item.status];
              return (
                <div key={item.id} className="bg-surface rounded-xl overflow-hidden soft-shadow border border-surface-variant">
                  <div className="relative h-48 overflow-hidden bg-surface-variant">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full font-label-sm text-[10px] font-bold uppercase ${statusCfg.class}`}>
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>
                  <div className="p-md">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{item.category}</span>
                    <h3 className="font-headline-sm text-headline-sm text-primary mt-1 mb-sm">{item.title}</h3>
                    <div className="flex justify-between items-center mb-md">
                      <div>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">Starting Bid</p>
                        <p className="font-headline-sm text-headline-sm text-primary font-bold">${item.startingBid.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-label-sm text-label-sm text-on-surface-variant">Views</p>
                        <p className="font-label-md text-label-md text-on-surface">{item.views.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-sm">
                      <button className="flex-1 border border-outline-variant rounded-lg py-2 font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors flex items-center justify-center gap-xs">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        Edit
                      </button>
                      {item.status === "live" && (
                        <Link
                          href={`/auctions/${item.id}`}
                          className="flex-1 bg-secondary text-on-secondary rounded-lg py-2 font-label-md text-label-md flex items-center justify-center gap-xs hover:bg-secondary-fixed-dim transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                          View Live
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </CollectorShell>
  );
}
