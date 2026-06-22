import Link from "next/link";
import { StoredUser, getUserDisplayName, getUserInitials } from "@/lib/userSession";

export default function SidebarUserCard({ user }: { user: StoredUser | null }) {
  const name = user ? getUserDisplayName(user) : "Collector";
  const initials = user ? getUserInitials(user) : "LA";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.045] p-4 shadow-[0_16px_40px_rgba(0,0,0,.14)] backdrop-blur">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#e4ca84] via-[#b99445] to-[#344d61] p-[2px] shadow-lg">
          <span className="grid h-full w-full place-items-center rounded-full bg-[#10253a] text-xs font-bold tracking-wider text-[#f3d88e]">{initials}</span>
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#10253a] bg-[#55b596]" />
        </Link>
        <div className="min-w-0"><p className="truncate font-display-lg text-sm font-semibold text-white">{name}</p><p className="mt-0.5 text-[11px] text-[#8fa0ae]">Người sưu tầm</p></div>
      </div>
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#c7a85c]/25 bg-[#c7a85c]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-[#dcc47e]"><span className="material-symbols-outlined text-[13px]">verified</span>{user ? "Verified buyer" : "Collector account"}</div>
    </div>
  );
}
