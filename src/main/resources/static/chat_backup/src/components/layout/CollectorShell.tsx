import type { ReactNode } from "react";
import CollectorSidebar from "./CollectorSidebar";

interface Props {
  children: ReactNode;
  mainClass?: string;
}

export default function CollectorShell({
  children,
  mainClass = "flex-1 ml-0 md:ml-64 h-screen overflow-y-auto bg-background",
}: Props) {
  return (
    <div className="bg-background text-on-surface font-body-md flex h-screen overflow-hidden">
      <CollectorSidebar />
      <main className={mainClass}>{children}</main>
    </div>
  );
}
