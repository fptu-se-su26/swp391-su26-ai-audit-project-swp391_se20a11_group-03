type Props = {
  status?: string | null;
  label?: string;
  pulse?: boolean;
  className?: string;
};

function normalize(status?: string | null) {
  return (status || "").toUpperCase();
}

export default function StatusBadge({ status, label, pulse = false, className = "" }: Props) {
  const value = normalize(status);
  const tone =
    value === "ACTIVE" || value === "LIVE"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : value === "UPCOMING"
        ? "border-[#d6a84f]/40 bg-[#fff8e6] text-[#9a6b13]"
        : value === "ENDED" || value === "PAID" || value === "AWAITING_PAYMENT"
          ? "border-slate-200 bg-slate-100 text-slate-700"
          : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.12em] ${tone} ${className}`}>
      {(pulse || value === "ACTIVE" || value === "LIVE") && (
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      )}
      {label || value || "STATUS"}
    </span>
  );
}
