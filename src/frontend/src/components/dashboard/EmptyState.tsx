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
    <div className="relative overflow-hidden rounded-[28px] border border-dashed border-[#d2ad55]/45 bg-[#0e0d0b] px-6 py-14 text-center shadow-[0_18px_55px_rgba(0,0,0,.4)]">
      <div className="pointer-events-none absolute left-1/2 top-0 h-36 w-36 -translate-x-1/2 rounded-full bg-[#d2ad55]/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[.05] [background-image:linear-gradient(#d4aa61_1px,transparent_1px),linear-gradient(90deg,#d4aa61_1px,transparent_1px)] [background-size:34px_34px]" />
      <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-[#f0ce88] to-[#c99a4b] text-[#100d08] shadow-[0_16px_34px_rgba(201,154,75,.28)]">
        <span className="material-symbols-outlined text-[30px]">{icon}</span>
      </span>
      <h3 className="relative mt-5 font-display-lg text-xl font-black tracking-[-.03em] text-[#f5ead9]">{title}</h3>
      <p className="relative mx-auto mt-2 max-w-md text-sm leading-6 text-[#b7aea3]">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="relative mt-6 inline-flex rounded-full bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] px-5 py-3 text-xs font-bold text-[#100d08] shadow-[0_16px_34px_rgba(201,154,75,.28)] transition hover:-translate-y-0.5 hover:brightness-110"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
