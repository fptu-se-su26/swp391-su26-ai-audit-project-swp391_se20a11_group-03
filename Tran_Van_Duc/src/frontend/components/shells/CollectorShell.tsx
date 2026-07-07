import Link from "next/link";
import BidZoneLogo from "@/components/brand/BidZoneLogo";
import CollectorSidebar from "@/components/shells/CollectorSidebar";
import LiveChat from "@/components/feature/LiveChat";
import { mockUser } from "@/lib/mock-data";

export default function CollectorShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="luxora-app flex min-h-screen">
      <CollectorSidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:hidden">
          <Link href="/" className="flex items-center" aria-label="BidZone">
            <BidZoneLogo className="h-9 w-auto" />
          </Link>
          <div
            className="h-8 w-8 rounded-full bg-cover bg-center"
            style={{ backgroundImage: `url(${mockUser.avatar})` }}
          />
        </header>

        <main className="flex-1">{children}</main>
      </div>

      <LiveChat />
    </div>
  );
}
