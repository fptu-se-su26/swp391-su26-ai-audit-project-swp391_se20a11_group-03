import Link from "next/link";
import BidZoneLogo from "@/components/brand/BidZoneLogo";
import AdminSidebar from "@/components/shells/AdminSidebar";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="luxora-app flex min-h-screen">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:hidden">
          <Link href="/admin/dashboard" aria-label="BidZone Admin">
            <BidZoneLogo className="h-8 w-auto" />
          </Link>
          <ThemeToggle />
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
