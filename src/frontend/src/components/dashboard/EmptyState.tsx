import Link from "next/link";

export default function EmptyState({
  icon = "inventory_2",
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-dashed border-[#d2ad55]/45 bg-white/70 px-6 py-14 text-center shadow-[0_18px_55px_rgba(15,23,42,.06)] backdrop-blur">
      <div className="pointer-events-none absolute left-1/2 top-0 h-36 w-36 -translate-x-1/2 rounded-full bg-[#d2ad55]/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[.04] [background-image:linear-gradient(#071626_1px,transparent_1px),linear-gradient(90deg,#071626_1px,transparent_1px)] [background-size:34px_34px]" />
      <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#071626] text-[#f0d98b] shadow-[0_16px_34px_rgba(7,22,38,.18)]">
        <span className="material-symbols-outlined text-[30px]">{icon}</span>
      </span>
      <h3 className="relative mt-5 font-display-lg text-xl font-black tracking-[-.03em] text-[#071626]">{title}</h3>
      <p className="relative mx-auto mt-2 max-w-md text-sm leading-6 text-[#687586]">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="relative mt-6 inline-flex rounded-full bg-[#071626] px-5 py-3 text-xs font-bold text-[#f0d98b] shadow-[0_16px_34px_rgba(7,22,38,.18)] transition hover:-translate-y-0.5 hover:bg-[#0b2037]"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
