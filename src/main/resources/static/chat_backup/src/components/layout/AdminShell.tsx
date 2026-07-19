import type { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex overflow-hidden h-screen">
      <AdminSidebar />
      <main className="ml-80 flex-1 h-screen overflow-y-auto bg-background">{children}</main>
    </div>
  );
}
