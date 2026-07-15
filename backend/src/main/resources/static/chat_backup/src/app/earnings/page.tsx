import { mockPayouts } from "@/lib/mock-data";
import CollectorShell from "@/components/layout/CollectorShell";

const STATUS_CONFIG = {
  processed: { label: "Processed", class: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
  processing: { label: "Processing", class: "bg-secondary-container text-on-secondary-container" },
};

export default function EarningsPage() {
  return (
    <CollectorShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary">Earnings & Payouts</h1>
          <p className="font-body-lg text-on-surface-variant mt-xs">Manage your revenue, withdrawals, and financial history.</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant">
            <p className="font-label-md text-label-md text-on-surface-variant mb-xs">Net Earnings</p>
            <h3 className="font-headline-md text-headline-md md:text-[32px] md:leading-[40px] font-bold text-primary">$1,850,000</h3>
            <div className="mt-md flex items-center text-on-tertiary-container text-xs">
              <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
              <span>Total lifetime earnings after fees</span>
            </div>
          </div>

          <div className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant">
            <p className="font-label-md text-label-md text-on-surface-variant mb-xs">Pending Clearing</p>
            <h3 className="font-headline-md text-headline-md md:text-[32px] md:leading-[40px] font-bold text-primary">$250,000</h3>
            <p className="mt-md text-[12px] text-on-surface-variant leading-tight">
              Funds from recently sold items waiting for buyer payment.
            </p>
          </div>

          <div className="bg-surface rounded-xl p-md soft-shadow border border-secondary/20 bg-gradient-to-br from-surface to-secondary-container/5">
            <p className="font-label-md text-label-md text-on-surface-variant mb-xs">Available to Withdraw</p>
            <h3 className="font-headline-md text-headline-md md:text-[32px] md:leading-[40px] font-bold text-primary">$1,600,000</h3>
            <button className="w-full mt-md bg-secondary text-on-secondary font-label-md py-sm rounded-lg hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed transition-colors glow-accent">
              Withdraw Funds
            </button>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-surface-container-low rounded-xl p-md border border-surface-variant flex flex-col md:flex-row md:items-center justify-between gap-sm">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-secondary">account_balance</span>
            <span className="font-body-md text-on-surface">
              Linked Bank Account: <span className="font-semibold">JPMorgan Chase ending in ****4582</span>
            </span>
          </div>
          <a href="#" className="text-secondary font-label-md hover:underline flex items-center gap-xs">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Account
          </a>
        </div>

        {/* Payout History */}
        <section className="space-y-md">
          <h2 className="font-headline-sm text-headline-sm text-primary border-b border-surface-variant pb-xs">Payout History</h2>
          <div className="bg-surface rounded-xl soft-shadow border border-surface-variant overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-surface-variant">
                  {["Date", "Reference ID", "Amount", "Destination", "Status"].map((h) => (
                    <th key={h} className="p-md font-label-sm text-label-sm text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-body-md text-sm">
                {mockPayouts.map((payout) => {
                  const cfg = STATUS_CONFIG[payout.status];
                  return (
                    <tr key={payout.id} className="border-b border-surface-variant hover:bg-surface-container-lowest transition-colors">
                      <td className="p-md text-on-surface">{payout.date}</td>
                      <td className="p-md font-mono text-xs text-on-surface-variant">{payout.ref}</td>
                      <td className="p-md font-bold text-primary">${payout.amount.toLocaleString()}.00</td>
                      <td className="p-md text-on-surface-variant">{payout.destination}</td>
                      <td className="p-md">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.class}`}>
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </CollectorShell>
  );
}
