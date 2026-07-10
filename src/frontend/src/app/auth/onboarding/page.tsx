import { redirect } from "next/navigation";

/** Legacy mock onboarding URL — send users to the real signup flow. */
export default function OnboardingPage() {
  redirect("/auth?mode=signup");
}
