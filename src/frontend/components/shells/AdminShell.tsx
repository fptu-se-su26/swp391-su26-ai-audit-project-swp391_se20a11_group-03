import AdminSidebar from "@/components/shells/AdminSidebar";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="luxora-app flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
