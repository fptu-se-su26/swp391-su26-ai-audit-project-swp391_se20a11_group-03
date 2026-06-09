import { mockWonItems } from "@/lib/mock-data";
import CollectorShell from "@/components/layout/CollectorShell";

export default function WonItemsPage() {
  return (
    <CollectorShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        <section>
          <h2 className="font-display-lg-mobile md:font-display-lg text-primary">Won Items & History</h2>
          <p className="font-body-lg text-on-surface-variant mt-xs">Review your successful acquisitions and past bids.</p>
        </section>

        <section>
          <div className="bg-surface rounded-xl soft-shadow border border-surface-variant overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-variant">
                    {["Date", "Lot / Item", "Winning Bid", "Payment Status", "Actions"].map((h, i) => (
                      <th key={h} className={`p-md font-label-sm text-label-sm text-on-surface-variant ${i === 4 ? "text-right" : ""}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockWonItems.map((item) => (
                    <tr key={item.id} className="border-b border-surface-variant hover:bg-surface-container-lowest transition-colors">
                      <td className="p-md font-body-md text-sm text-on-surface">{item.date}</td>
                      <td className="p-md">
                        <div className="flex items-center gap-sm">
                          <div className="w-12 h-12 rounded bg-surface-variant overflow-hidden shrink-0">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-label-md text-label-md text-primary">Lot #{item.lotNumber}</p>
                            <p className="font-body-md text-sm text-on-surface-variant truncate w-40">{item.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-md font-headline-sm text-[16px] font-bold text-primary">
                        ${item.winningBid.toLocaleString()}
                      </td>
                      <td className="p-md">
                        {item.status === "paid" ? (
                          <span className="inline-flex items-center gap-1 bg-tertiary-fixed text-on-tertiary-fixed-variant px-2 py-1 rounded-full font-label-sm text-[10px]">
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full font-label-sm text-[10px]">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="p-md text-right">
                        <button className="text-on-surface-variant hover:text-primary transition-colors p-1" title="Download Invoice">
                          <span className="material-symbols-outlined">receipt</span>
                        </button>
                        <button
                          className={`p-1 ml-2 transition-colors ${item.status === "paid" ? "text-on-surface-variant hover:text-primary" : "text-outline-variant cursor-not-allowed"}`}
                          title="Track Shipping"
                        >
                          <span className="material-symbols-outlined">local_shipping</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </CollectorShell>
  );
}
