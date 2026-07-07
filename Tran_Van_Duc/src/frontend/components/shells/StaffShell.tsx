import StaffSidebar from "@/components/shells/StaffSidebar";

export default function StaffShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="luxora-app flex min-h-screen">
      <StaffSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
