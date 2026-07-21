import CollectorShell from "@/components/shells/CollectorShell";
import ContractsClient from "@/app/contracts/ContractsClient";

export default function ContractsPage() {
  return (
    <CollectorShell>
      <ContractsClient />
    </CollectorShell>
  );
}
