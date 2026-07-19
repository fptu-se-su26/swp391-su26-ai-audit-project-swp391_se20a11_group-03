import Link from "next/link";

type Props = {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
  badge?: number;
};

export default function SidebarMenuItem({ href, icon, label, active, badge }: Props) {
  return (
    <Link
      href={href}
      className={`group relative flex items-center justify-between overflow-hidden rounded-2xl px-3 py-3 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#dabe73] ${
        active
          ? "bg-gradient-to-r from-[#d5b767]/20 via-[#d5b767]/10 to-white/[.03] text-[#f5d987] shadow-[inset_3px_0_0_#d5b767,0_14px_30px_rgba(0,0,0,.14)]"
          : "text-[#aeb9c3] hover:translate-x-0.5 hover:bg-white/[.06] hover:text-white"
      }`}
    >
      {active && <span className="absolute inset-y-2 right-3 w-10 rounded-full bg-[#d5b767]/10 blur-xl" />}
      <span className="relative flex items-center gap-3">
        <span className={`material-symbols-outlined text-[20px] transition-transform group-hover:scale-105 ${active ? "text-[#dabe73]" : "text-[#788a99] group-hover:text-[#dabe73]"}`}>
          {icon}
        </span>
        <span className="text-[13px] font-semibold">{label}</span>
      </span>
      {!!badge && badge > 0 && (
        <span className="relative min-w-5 rounded-full bg-[#d1b268] px-1.5 py-0.5 text-center text-[9px] font-bold text-[#071626]">
          {badge}
        </span>
      )}
    </Link>
  );
}
