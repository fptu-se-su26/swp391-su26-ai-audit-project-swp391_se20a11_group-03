import type { ReactNode } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface Props {
  children: ReactNode;
  mainClass?: string;
}

export default function CollectorShell({
  children,
  mainClass = "",
}: Props) {
  const isMessageLayout = mainClass.includes("overflow-hidden");
  return <DashboardLayout><div className={isMessageLayout ? "h-screen overflow-hidden" : "min-h-screen"}>{children}</div></DashboardLayout>;
}
