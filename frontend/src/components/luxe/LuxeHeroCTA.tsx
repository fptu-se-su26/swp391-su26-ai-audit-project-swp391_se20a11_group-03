"use client";

import { useEffect, useState } from "react";
import { GoldButton, OutlineButton } from "./primitives";
import { useTranslations } from "@/i18n/I18nProvider";
import { getStoredUser, subscribeStoredUser } from "@/lib/userSession";

export default function LuxeHeroCTA() {
  const t = useTranslations("luxe");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const sync = () => setLoggedIn(!!getStoredUser());
    sync();
    return subscribeStoredUser(sync);
  }, []);

  return (
    <div className="mt-10 flex flex-wrap items-center gap-7">
      <GoldButton href="/browse">
        {t("exploreNow")} <span className="material-symbols-outlined text-base">arrow_forward_ios</span>
      </GoldButton>
      {loggedIn && (
        <OutlineButton href="/dashboard">
          {t("goDashboard")} <span className="material-symbols-outlined text-base">dashboard</span>
        </OutlineButton>
      )}
      <OutlineButton href="/live">
        <span className="material-symbols-outlined text-base">gavel</span>
        {t("liveAuction")}
      </OutlineButton>
    </div>
  );
}
