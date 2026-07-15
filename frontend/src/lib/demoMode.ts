import type { StoredUser } from "@/lib/userSession";

// Never allow the convenience login path into a production bundle.
export const DEMO_MODE =
  process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_DEMO_MODE === "true";
export const DEMO_KYC_KEY = "luxe.demo.kyc.v2";

export function createDemoUser(email: string): StoredUser {
  const normalized = email.toLowerCase();
  const seller = normalized.includes("seller");
  const staff = normalized.includes("staff");
  const admin = normalized.includes("admin");
  const roleName = admin ? "Admin" : staff ? "Staff" : seller ? "Seller" : "User";
  const user: StoredUser = {
    userId: admin ? 9004 : staff ? 9003 : seller ? 9002 : 9001,
    username: admin ? "Demo Admin" : staff ? "Demo Staff" : seller ? "Demo Seller" : "Demo Collector",
    email,
    roleName,
    status: "ACTIVE",
    token: `demo-token-${roleName.toLowerCase()}`,
    identityVerified: false,
    profileStatus: "PENDING_IDENTITY_VERIFY",
  };

  if (typeof window === "undefined") return user;
  try {
    const submissions = JSON.parse(localStorage.getItem(DEMO_KYC_KEY) || "[]") as Array<{
      userId?: number;
      status?: string;
      submittedAt?: string | null;
    }>;
    const latest = submissions
      .filter((item) => item.userId === user.userId)
      .sort((a, b) => Date.parse(b.submittedAt ?? "") - Date.parse(a.submittedAt ?? ""))[0];
    if (latest?.status === "APPROVED") return { ...user, identityVerified: true, profileStatus: "VERIFIED" };
    if (latest?.status === "REJECTED") return { ...user, profileStatus: "KYC_REJECTED" };
    if (latest?.status === "INFO_REQUIRED") return { ...user, profileStatus: "KYC_INFO_REQUIRED" };
  } catch {
    // A corrupt demo cache should never prevent login.
  }
  return user;
}

export function readDemoUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("currentUser") || "null"); } catch { return null; }
}
