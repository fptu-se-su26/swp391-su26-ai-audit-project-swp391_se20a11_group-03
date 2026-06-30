type Props = {
  balance: string;
  currency?: string;
};

export default function WalletCard({ balance, currency = "VND" }: Props) {
  return (
    <div className="brand-ring relative overflow-hidden rounded-3xl bg-slate-950 p-7 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_15%,rgba(37,99,235,.34),transparent_30%),radial-gradient(circle_at_8%_90%,rgba(124,58,237,.2),transparent_30%)]" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-[.2em] text-blue-200">Số dư khả dụng</span>
          <span className="material-symbols-outlined text-blue-200">account_balance_wallet</span>
        </div>
        <p className="mt-6 font-display-lg text-3xl font-black tracking-[-.04em]">
          {balance} <span className="text-sm font-medium text-slate-300">{currency}</span>
        </p>
        <p className="mt-2 text-xs text-slate-300">Được bảo vệ bởi BidZone Secure Payment</p>
        <div className="mt-7 flex gap-2">
          <button className="rounded-full bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-500">
            Nạp tiền
          </button>
          <button className="rounded-full border border-white/20 px-5 py-2.5 text-xs font-semibold transition hover:bg-white/10">
            Rút tiền
          </button>
        </div>
      </div>
    </div>
  );
}
