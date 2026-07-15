import Link from "next/link";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  actionHref?: string;
};

export default function DashboardHeader({
  eyebrow = "Collector workspace",
  title,
  subtitle,
  actionLabel,
  actionHref,
}: Props) {
  return (
    <header className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0c0b09] p-6 text-white shadow-[0_28px_80px_rgba(0,0,0,.45)] lg:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(212,170,97,.2),transparent_28%),radial-gradient(circle_at_90%_18%,rgba(210,173,85,.2),transparent_26%),linear-gradient(135deg,rgba(255,255,255,.06),transparent_36%)]" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#d2ad55]/20" />
      <div className="pointer-events-none absolute right-8 top-8 h-24 w-24 rounded-full bg-[#d2ad55]/10 blur-2xl" />
      <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d2ad55]/60 to-transparent" />

      <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.28em] text-[#f1cf78]">{eyebrow}</p>
          <h1 className="mt-3 font-display-lg text-4xl font-black tracking-[-.06em] text-transparent bg-clip-text bg-gradient-to-r from-[#fff8df] via-[#d9b55b] to-[#a87918] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d4deea]">{subtitle}</p>
        </div>

        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-[#b8860b] via-[#d7b55c] to-[#f0d98b] px-5 py-3 text-xs font-black text-[#06111f] shadow-[0_18px_40px_rgba(199,160,62,.24)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(199,160,62,.34)]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            {actionLabel}
          </Link>
        )}
      </div>
    </header>
  );
}
