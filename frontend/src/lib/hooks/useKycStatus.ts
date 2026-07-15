"use client";

import { useEffect, useState } from "react";
import { getStoredUser } from "@/lib/userSession";
import { getMyProfile, type UserProfile } from "@/lib/services/userProfileService";

export type KycStatus = "loading" | "verified" | "unverified" | "anonymous";

/**
 * Live KYC status hook used to gate bidding and selling flows.
 * Refreshes when the storage event fires (login/logout/profile update).
 */
export function useKycStatus(): {
  status: KycStatus;
  profile: UserProfile | null;
  refresh: () => Promise<void>;
} {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<KycStatus>("loading");

  const refresh = async () => {
    const user = getStoredUser();
    if (!user?.token) {
      setStatus("anonymous");
      setProfile(null);
      return;
    }
    try {
      const p = await getMyProfile();
      setProfile(p);
      setStatus(p.identityVerified ? "verified" : "unverified");
    } catch {
      setStatus("unverified");
      setProfile(null);
    }
  };

  useEffect(() => {
    void refresh();
    const handler = () => {
      void refresh();
    };
    window.addEventListener("storage", handler);
    window.addEventListener("current-user-changed", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("current-user-changed", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, profile, refresh };
}
