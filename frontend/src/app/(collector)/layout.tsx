import CollectorSidebar from "@/components/layout/CollectorSidebar";

export default function CollectorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-on-surface font-body-md flex h-screen overflow-hidden">
      <CollectorSidebar />
      <main className="flex-1 ml-0 md:ml-64 h-screen overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
}
