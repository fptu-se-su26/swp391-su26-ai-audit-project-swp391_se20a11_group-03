type Props = {
  label: string;
  caption?: string;
  urgent?: boolean;
  className?: string;
};

export default function CountdownBadge({ label, caption, urgent = false, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs font-bold ${
        urgent
          ? "border-red-200 bg-red-50 text-red-700 shadow-[0_0_0_4px_rgba(239,68,68,.08)]"
          : "border-[#d6a84f]/40 bg-[#fff8e6] text-[#9a6b13]"
      } ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${urgent ? "bg-red-500 animate-pulse" : "bg-[#9a6b13]"}`} />
      <span>{label}</span>
      {caption && <span className="hidden font-sans text-[10px] font-semibold uppercase tracking-wide opacity-70 sm:inline">{caption}</span>}
    </span>
  );
}
