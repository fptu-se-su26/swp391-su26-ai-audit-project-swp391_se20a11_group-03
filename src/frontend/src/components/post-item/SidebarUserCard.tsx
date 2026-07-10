"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StoredUser, getUserDisplayName, getUserInitials, isSeller } from "@/lib/userSession";
import { getMyProfile } from "@/lib/services/userProfileService";
import { getMyKyc, type KycSubmission } from "@/lib/services/kycService";

type BadgeTone = "verified" | "pending" | "unverified";

function resolveBadge(identityVerified: boolean, kyc: KycSubmission | null): { tone: BadgeTone; label: string; icon: string } {
  if (identityVerified) {
    return { tone: "verified", label: "Đã xác thực", icon: "verified" };
  }
  if (kyc?.status === "PENDING") {
    return { tone: "pending", label: "Chờ duyệt KYC", icon: "hourglass_top" };
  }
  return { tone: "unverified", label: "Chưa xác thực", icon: "shield_person" };
}

const badgeStyles: Record<BadgeTone, string> = {
  verified: "border-[#c7a85c]/25 bg-[#c7a85c]/10 text-[#dcc47e]",
  pending: "border-[#c4a356]/30 bg-[#c4a356]/10 text-[#e6cb82]",
  unverified: "border-white/15 bg-white/[.04] text-[#8fa0ae]",
};

export default function SidebarUserCard({ user }: { user: StoredUser | null }) {
  const name = user ? getUserDisplayName(user) : "Collector";
  const initials = user ? getUserInitials(user) : "BZ";
  const [identityVerified, setIdentityVerified] = useState(Boolean(user?.identityVerified));
  const [kyc, setKyc] = useState<KycSubmission | null>(null);

  useEffect(() => {
    if (!user?.token) {
      setIdentityVerified(false);
      setKyc(null);
      return;
    }
    let cancelled = false;
    Promise.all([getMyProfile(), getMyKyc()])
      .then(([profile, submission]) => {
        if (cancelled) return;
        setIdentityVerified(Boolean(profile?.identityVerified));
        setKyc(submission);
      })
      .catch(() => {
        if (!cancelled) {
          setIdentityVerified(Boolean(user.identityVerified));
          setKyc(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user?.token, user?.userId, user?.identityVerified]);

  const badge = user ? resolveBadge(identityVerified, kyc) : { tone: "unverified" as const, label: "Tài khoản khách", icon: "person" };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[.055] p-4 shadow-[0_18px_45px_rgba(0,0,0,.18)] backdrop-blur">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#d2ad55]/15 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#d2ad55]/40 to-transparent" />
      <div className="relative flex items-center gap-3">
        <Link href="/profile" className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#e4ca84] via-[#b99445] to-[#5a4118] p-[2px] shadow-lg">
          <span className="grid h-full w-full place-items-center rounded-full bg-[#100d08] text-xs font-bold tracking-wider text-[#f3d88e]">{initials}</span>
          <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#100d08] ${identityVerified ? "bg-[#55b596]" : "bg-[#8fa0ae]"}`} />
        </Link>
        <div className="min-w-0">
          <p className="truncate font-display-lg text-sm font-semibold text-white">{name}</p>
          <p className="mt-0.5 text-[11px] text-[#a9b8c6]">{user && isSeller(user) ? "Người bán" : "Người sưu tầm"}</p>
        </div>
      </div>
      <div className={`relative mt-4 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] ${badgeStyles[badge.tone]}`}>
        <span className="material-symbols-outlined text-[13px]">{badge.icon}</span>
        {badge.label}
      </div>
    </div>
  );
}

