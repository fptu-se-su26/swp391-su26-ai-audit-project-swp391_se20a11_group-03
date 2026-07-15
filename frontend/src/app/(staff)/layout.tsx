import StaffSidebar from "@/components/layout/StaffSidebar";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex overflow-hidden">
      <StaffSidebar />
      <main className="ml-72 flex-1 h-screen overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
}
