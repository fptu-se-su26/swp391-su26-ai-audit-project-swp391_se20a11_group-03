import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { NavigationProvider } from "@/lib/NavigationContext";
import { I18nProvider } from "@/i18n/I18nProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LuxeAuction — Đấu giá đẳng cấp, chính xác từng phiên",
  description: "Cộng đồng nhà sưu tầm đẳng cấp nhất thế giới. Sang trọng đã xác thực, tiếp cận toàn cầu.",
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
      <body className={`${inter.variable} ${montserrat.variable} bg-background text-on-surface font-body-md`}>
        <I18nProvider>
          <NavigationProvider>
            {children}
          </NavigationProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
