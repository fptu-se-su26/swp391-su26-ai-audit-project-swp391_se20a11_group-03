import CollectorShell from "@/components/shells/CollectorShell";
import ProfileClient from "@/app/profile/ProfileClient";

export default function ProfilePage() {
  return (
    <CollectorShell>
      <ProfileClient />
    </CollectorShell>
  );
}
