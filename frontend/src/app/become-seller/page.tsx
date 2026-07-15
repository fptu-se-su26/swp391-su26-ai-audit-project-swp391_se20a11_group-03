"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CollectorShell from "@/components/layout/CollectorShell";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SellerContractPanel from "@/components/features/SellerContractPanel";
import {
  StoredUser,
  getStoredUser,
  isAdmin,
  isSeller,
  saveStoredUser,
  subscribeStoredUser,
} from "@/lib/userSession";
import { useTranslations } from "@/i18n/I18nProvider";
import { getMyProfile } from "@/lib/services/userProfileService";
import { getMySellerContract, SellerContract } from "@/lib/services/sellerContractService";
import { getStoredToken } from "@/lib/apiClient";

export default function BecomeSellerPage() {
  const t = useTranslations("becomeSeller");
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [contractSigned, setContractSigned] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncUser = () => setCurrentUser(getStoredUser());
    syncUser();
    return subscribeStoredUser(syncUser);
  }, []);

  useEffect(() => {
    if (!getStoredToken()) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    Promise.all([getMyProfile().catch(() => null), getMySellerContract().catch(() => null)])
      .then(([profile, contract]) => {
        if (cancelled) return;
        setIdentityVerified(Boolean(profile?.identityVerified));
        setContractSigned(Boolean(contract?.signed));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSubmitted(contract: SellerContract) {
    const user = getStoredUser();
    if (user) {
      saveStoredUser({
        ...user,
        roleName: contract.roleName ?? "Seller",
      });
    }
    setContractSigned(true);
    window.setTimeout(() => router.push("/post-item"), 1200);
  }

  if (!getStoredToken() || !currentUser) {
    return (
      <CollectorShell>
        <div className="mx-auto max-w-[900px] px-4 py-14 text-center">
          <p className="text-on-surface-variant">{t("signInRequired")}</p>
          <Link href="/auth" className="mt-4 inline-block text-secondary hover:underline">
            {t("signInCta")}
          </Link>
        </div>
      </CollectorShell>
    );
  }

  if (isAdmin(currentUser)) {
    return (
      <CollectorShell>
        <div className="mx-auto max-w-[900px] px-4 py-14">
          <p className="text-on-surface-variant">{t("adminNoNeed")}</p>
          <Link href="/post-item" className="mt-4 inline-block text-secondary hover:underline">
            {t("goPostItem")}
          </Link>
        </div>
      </CollectorShell>
    );
  }

  if (!loading && contractSigned && isSeller(currentUser)) {
    return (
      <CollectorShell>
        <div className="mx-auto max-w-[900px] space-y-4 px-4 py-14">
          <p className="text-on-tertiary-container">{t("alreadySeller")}</p>
          <Link
            href="/post-item"
            className="inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-on-secondary"
          >
            {t("goPostItem")}
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </CollectorShell>
    );
  }

  return (
    <CollectorShell>
      <div className="mx-auto max-w-[960px] space-y-6 px-4 py-10 sm:px-7 lg:py-14">
        <DashboardHeader eyebrow={t("eyebrow")} title={t("pageTitle")} subtitle={t("pageSubtitle")} />

        <div className="rounded-2xl border border-[#e0d9ce] bg-white/90 p-6 shadow-sm">
          {!loading && (
            <SellerContractPanel
              userId={currentUser.userId}
              identityVerified={identityVerified}
              onSubmitted={handleSubmitted}
            />
          )}
        </div>

        <p className="text-center text-xs text-on-surface-variant">{t("footerNote")}</p>
      </div>
    </CollectorShell>
  );
}
