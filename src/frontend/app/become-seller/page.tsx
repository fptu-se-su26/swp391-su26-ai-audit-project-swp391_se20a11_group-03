import CollectorShell from "@/components/shells/CollectorShell";
import BecomeSellerClient from "@/app/become-seller/BecomeSellerClient";

export default function BecomeSellerPage() {
  return (
    <CollectorShell>
      <BecomeSellerClient />
    </CollectorShell>
  );
}
