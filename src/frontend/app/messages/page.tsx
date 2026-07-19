import CollectorShell from "@/components/shells/CollectorShell";
import MessagesClient from "@/app/messages/MessagesClient";

export default function MessagesPage() {
  return (
    <CollectorShell>
      <MessagesClient />
    </CollectorShell>
  );
}
