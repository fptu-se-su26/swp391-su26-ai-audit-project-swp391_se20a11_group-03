import AdminShell from "@/components/shells/AdminShell";
import EventsClient from "./EventsClient";

export default function AdminEventsPage() {
  return (
    <AdminShell>
      <EventsClient />
    </AdminShell>
  );
}
