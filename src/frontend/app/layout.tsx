import type { Metadata } from "next";
import MaterialSymbolsLoader from "@/components/performance/MaterialSymbolsLoader";
import "./globals.css";

export const metadata: Metadata = {
  title: "BidZone | Sàn đấu giá cao cấp",
  description: "Sàn đấu giá cao cấp: đồng hồ, công nghệ, túi xách, đồ sưu tầm giới hạn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <head>
      </head>
      <body className="min-h-full flex flex-col bg-black text-white">
        {children}
        <MaterialSymbolsLoader />
      </body>
    </html>
  );
}
