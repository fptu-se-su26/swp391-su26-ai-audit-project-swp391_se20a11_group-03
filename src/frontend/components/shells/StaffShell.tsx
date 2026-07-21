import Link from "next/link";
import BidZoneLogo from "@/components/brand/BidZoneLogo";
import StaffSidebar from "@/components/shells/StaffSidebar";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function StaffShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="luxora-app flex min-h-screen">
      <StaffSidebar />
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:hidden">
          <Link href="/staff/approvals" aria-label="BidZone Staff">
            <BidZoneLogo className="h-8 w-auto" />
          </Link>
          <ThemeToggle />
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
