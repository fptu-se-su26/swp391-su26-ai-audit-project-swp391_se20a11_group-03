import Link from "next/link";

type Props = { eyebrow?: string; title: string; subtitle: string; actionLabel?: string; actionHref?: string };

export default function DashboardHeader({ eyebrow = "Collector workspace", title, subtitle, actionLabel, actionHref }: Props) {
  return (
    <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
      <div><p className="text-[9px] font-bold uppercase tracking-[.22em] text-[#9a7429]">{eyebrow}</p><h1 className="mt-2 font-display-lg text-3xl font-semibold tracking-[-.04em] text-[#071626] sm:text-4xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#69747d]">{subtitle}</p></div>
      {actionLabel && actionHref && <Link href={actionHref} className="inline-flex w-fit items-center gap-2 rounded-full bg-[#071626] px-5 py-3 text-xs font-bold text-[#e7cc83] shadow-[0_10px_24px_rgba(7,22,38,.14)] transition hover:-translate-y-0.5"><span className="material-symbols-outlined text-[17px]">add</span>{actionLabel}</Link>}
    </header>
  );
}
