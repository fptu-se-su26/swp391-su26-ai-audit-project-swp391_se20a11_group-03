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
    <html
      lang="vi"
      data-theme="light"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var t=localStorage.getItem("bidzone-theme");document.documentElement.dataset.theme=t==="dark"?"dark":"light"}catch(e){document.documentElement.dataset.theme="light"}})()',
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        <MaterialSymbolsLoader />
      </body>
    </html>
  );
}
