"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import BidZoneLogo from "@/components/brand/BidZoneLogo";

const socialItems = [
  { label: "Facebook", href: "https://www.facebook.com", icon: FaFacebookF },
  { label: "Instagram", href: "https://www.instagram.com", icon: FaInstagram },
  { label: "X", href: "https://x.com", icon: FaXTwitter },
  { label: "YouTube", href: "https://www.youtube.com", icon: FaYoutube },
];

export default function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();
  const footerColumns = [
    {
      title: t("infoTitle"),
      links: [t("about"), t("contact"), t("terms"), t("privacy")],
    },
    {
      title: t("supportTitle"),
      links: [t("helpCenter"), t("biddingGuide"), t("payments"), t("shipping")],
    },
    {
      title: t("categoriesTitle"),
      links: [t("watches"), t("phones"), t("laptops"), t("cameras"), t("seeAll")],
    },
  ];
  return (
    <footer className="bg-black">
      <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-10 lg:grid-cols-[1.2fr_2fr_1fr]">
          <div>
            <Link
              href="/"
              className="inline-flex items-center"
              aria-label="BidZone"
            >
              <BidZoneLogo className="h-14 w-auto" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
              {t("tagline")}
            </p>
            <div className="mt-5 flex gap-3">
              {socialItems.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  title={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-white/70 transition-colors hover:border-[#f0c982]/60 hover:bg-[#f0c982]/10 hover:text-[#f0c982] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0c982]"
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-xs font-semibold tracking-[0.2em] text-[#f0c982]">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-2">
                  {column.links.map((link) => (
                    <li key={link}>
                      <Link
                        href="/storefront"
                        className="text-sm text-white/55 transition-colors hover:text-white"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-[0.2em] text-[#f0c982]">
              {t("infoTitle")}
            </h3>
            <div className="mt-4 space-y-2 text-sm leading-relaxed text-white/55">
              <p>{t("contactPhone", { phone: "1900 8888" })}</p>
              <p>{t("contactEmail", { email: "support@bidzone.com" })}</p>
              <p>{t("contactAddress", { address: "123 Lê Lợi, Quận 1, TP. Hồ Chí Minh" })}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>{t("copyright", { year })}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-white/75">
            <span>VISA</span>
            <span>Mastercard</span>
            <span>PayPal</span>
            <span>Apple Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
