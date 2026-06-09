import { mockUser, mockTransactions } from "@/lib/mock-data";
import CollectorShell from "@/components/layout/CollectorShell";

export default function WalletPage() {
  return (
    <CollectorShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary">My Wallet</h1>
          <p className="font-body-lg text-on-surface-variant mt-xs">Manage your funds and transaction history.</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="md:col-span-2 bg-primary-container text-on-primary rounded-2xl p-lg soft-shadow relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-secondary-container opacity-10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <p className="font-label-md text-label-md text-on-primary/60 uppercase tracking-widest mb-xs">Available Balance</p>
              <h2 className="text-[48px] font-bold leading-none text-secondary-fixed mb-md">
                ${mockUser.walletBalance.toLocaleString()}
              </h2>
              <div className="flex flex-wrap gap-md">
                <div>
                  <p className="font-label-sm text-label-sm text-on-primary/60">Locked Deposits</p>
                  <p className="font-headline-sm text-headline-sm font-bold">${mockUser.lockedDeposits.toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-primary/60">Total Portfolio Value</p>
                  <p className="font-headline-sm text-headline-sm font-bold">$1,240,000</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-sm">
            <button className="flex-1 bg-secondary text-on-secondary rounded-xl p-md font-label-md text-label-md glow-accent hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed transition-colors flex items-center justify-center gap-sm">
              <span className="material-symbols-outlined">add</span>
              Deposit Funds
            </button>
            <button className="flex-1 bg-surface border border-outline-variant rounded-xl p-md font-label-md text-label-md hover:bg-surface-container-low transition-colors flex items-center justify-center gap-sm">
              <span className="material-symbols-outlined">arrow_upward</span>
              Withdraw Funds
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <section>
          <h2 className="font-headline-sm text-headline-sm text-primary border-b border-surface-variant pb-xs mb-md">
            Transaction History
          </h2>
          <div className="bg-surface rounded-xl soft-shadow border border-surface-variant overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-surface-variant">
                  {["Date", "Type", "Description", "Amount", "Status"].map((h) => (
                    <th key={h} className="p-md font-label-sm text-label-sm text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-surface-variant hover:bg-surface-container-lowest transition-colors">
                    <td className="p-md font-body-md text-sm text-on-surface">{tx.date}</td>
                    <td className="p-md font-label-md text-label-md text-primary">{tx.type}</td>
                    <td className="p-md font-body-md text-sm text-on-surface-variant">{tx.description}</td>
                    <td className={`p-md font-bold font-headline-sm text-[16px] ${tx.amount > 0 ? "text-on-tertiary-container" : "text-on-surface"}`}>
                      {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toLocaleString()}
                    </td>
                    <td className="p-md">
                      {tx.status === "completed" && (
                        <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-2 py-1 rounded-full text-[10px] font-bold uppercase">
                          Completed
                        </span>
                      )}
                      {tx.status === "locked" && (
                        <span className="bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full text-[10px] font-bold uppercase">
                          Locked
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </CollectorShell>
  );
}
