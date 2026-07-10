"use client";

import { Suspense, useEffect, useState } from "react";
import PortalSwitcher from "./PortalSwitcher";
import { getStoredUser, isAdmin, subscribeStoredUser, StoredUser } from "@/lib/userSession";

export default function PortalSwitcherGate() {
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const sync = () => setUser(getStoredUser());
    sync();
    return subscribeStoredUser(sync);
  }, []);

  if (!isAdmin(user)) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <PortalSwitcher />
    </Suspense>
  );
}
