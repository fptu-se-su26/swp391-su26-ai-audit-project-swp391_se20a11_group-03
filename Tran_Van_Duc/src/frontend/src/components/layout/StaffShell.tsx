import type { ReactNode } from "react";
import StaffSidebar from "./StaffSidebar";

export default function StaffShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex overflow-hidden h-screen">
      <StaffSidebar />
      <main className="ml-72 flex-1 h-screen overflow-y-auto bg-background">{children}</main>
    </div>
  );
}
