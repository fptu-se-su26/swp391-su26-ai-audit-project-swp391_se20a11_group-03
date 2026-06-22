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
      className={`group flex items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d6b968] ${
        active
          ? "bg-gradient-to-r from-[#c5a454]/20 to-transparent text-[#f3d88e] shadow-[inset_2px_0_0_#d5b767]"
          : "text-[#aeb9c3] hover:bg-white/[.06] hover:text-white"
      }`}
    >
      <span className="flex items-center gap-3">
        <span className={`material-symbols-outlined text-[20px] transition-transform group-hover:scale-105 ${active ? "text-[#dabe73]" : "text-[#788a99] group-hover:text-[#dabe73]"}`}>{icon}</span>
        <span className="text-[13px] font-semibold">{label}</span>
      </span>
      {!!badge && badge > 0 && <span className="min-w-5 rounded-full bg-[#d1b268] px-1.5 py-0.5 text-center text-[9px] font-bold text-[#071626]">{badge}</span>}
    </Link>
  );
}
