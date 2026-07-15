import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex overflow-hidden">
      <AdminSidebar />
      <main className="ml-80 flex-1 h-screen overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
}
