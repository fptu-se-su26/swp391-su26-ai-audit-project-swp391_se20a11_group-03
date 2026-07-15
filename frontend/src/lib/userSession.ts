export type StoredUser = {
  userId?: number;
  username?: string;
  email?: string;
  roleName?: string;
  status?: string;
  token?: string;
  identityVerified?: boolean;
  profileStatus?: string;
};

const USER_EVENT = "user:changed";

function normalizeWhitespace(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function titleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem("currentUser");
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function saveStoredUser(user: StoredUser) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("currentUser", JSON.stringify(user));
  window.dispatchEvent(new Event(USER_EVENT));
  window.dispatchEvent(new Event("current-user-changed"));
}

export function notifyStoredUserChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(USER_EVENT));
}

export function subscribeStoredUser(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === "currentUser" || event.key === "token") {
      listener();
    }
  };

  window.addEventListener(USER_EVENT, listener);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(USER_EVENT, listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function getUserDisplayName(user: StoredUser | null) {
  if (!user) {
    return "Collector";
  }

  const primary = user.username || user.email || "Collector";
  const localPart = primary.includes("@") ? primary.split("@")[0] : primary;
  const cleaned = normalizeWhitespace(localPart.replace(/[._-]+/g, " "));

  return titleCase(cleaned || "Collector");
}

export function getUserInitials(user: StoredUser | null) {
  const displayName = getUserDisplayName(user);
  const parts = displayName.split(" ").filter(Boolean);
  return (parts[0]?.charAt(0) ?? "C").toUpperCase();
}

export function getRoleLabelKey(user: StoredUser | null): string {
  const role = user?.roleName?.trim();
  if (!role) {
    return "collector";
  }
  if (role.toLowerCase() === "user") {
    return "auctionMember";
  }
  if (role.toLowerCase().includes("seller")) {
    return "seller";
  }
  if (role.toLowerCase().includes("staff")) {
    return "staff";
  }
  if (role.toLowerCase().includes("admin")) {
    return "admin";
  }
  return `custom.${role.toLowerCase().replace(/\s+/g, "_")}`;
}

export function isSeller(user: StoredUser | null) {
  const role = user?.roleName?.toLowerCase() || "";
  return role.includes("seller");
}

export function isStaff(user: StoredUser | null) {
  const role = user?.roleName?.toLowerCase() || "";
  return role.includes("staff");
}

export function isAdmin(user: StoredUser | null) {
  const role = user?.roleName?.toLowerCase() || "";
  return role.includes("admin");
}

export function isBuyer(user: StoredUser | null) {
  if (!user) return false;
  const role = user.roleName?.toLowerCase() || "";
  return role === "user" || role === "";
}
