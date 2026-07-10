import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { NavigationProvider } from "@/lib/NavigationContext";
import { I18nProvider } from "@/i18n/I18nProvider";
import AdminRouteGuard from "@/components/layout/AdminRouteGuard";
import PortalSwitcherGate from "@/components/layout/PortalSwitcherGate";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--font-brand",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "BidZone - Modern auction marketplace",
  description: "Bid on authenticated watches, art, design and rare collectibles from trusted sellers worldwide.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className={`${beVietnam.variable} bg-background text-on-surface font-body-md`}>
        <I18nProvider>
          <NavigationProvider>
            <AdminRouteGuard>{children}</AdminRouteGuard>
          </NavigationProvider>
        </I18nProvider>
        <PortalSwitcherGate />
      </body>
    </html>
  );
}
