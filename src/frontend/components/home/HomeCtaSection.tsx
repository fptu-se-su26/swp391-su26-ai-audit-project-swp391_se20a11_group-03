"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { AUTH_STATE_EVENT, getToken } from "@/lib/api";

function subscribeToAuthState(onStoreChange: () => void) {
  window.addEventListener(AUTH_STATE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(AUTH_STATE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function hasStoredToken() {
  return Boolean(getToken());
}

export default function HomeCtaSection() {
  const isLoggedIn = useSyncExternalStore(
    subscribeToAuthState,
    hasStoredToken,
    () => false,
  );

  return (
    <section className="border-b border-white/10">
      <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 sm:py-14 lg:px-12">
        <div className="relative overflow-hidden rounded-lg border border-[#d7aa63]/45 bg-black">
          <Image
            src="/images/luxury-watch-hero.webp"
            alt="Đồng hồ cao cấp trong bộ sưu tập đấu giá"
            fill
            sizes="100vw"
            className="object-cover object-[72%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/88 to-black/30" />
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-gradient-to-l from-black/10 to-transparent lg:block" />

          <div className="relative min-h-64 px-4 py-7 sm:px-7 sm:py-8 lg:px-12">
            <div className="flex max-w-[680px] flex-col justify-center">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#f0c982]">
                Cơ hội cuối
              </p>
              <h2 className="text-xl font-semibold tracking-[0.06em] text-white sm:text-2xl sm:tracking-[0.12em] lg:text-3xl">
                SĂN ĐỒ HIẾM - GIÁ TỐT NHẤT
                <br />
                ĐỪNG BỎ LỠ PHIÊN ĐẤU GIÁ HÔM NAY!
              </h2>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auctions"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f0c982] px-7 text-sm font-semibold text-black transition-colors hover:bg-[#f4d79b]"
                >
                  XEM PHIÊN LIVE
                  <span className="material-symbols-outlined text-base">
                    arrow_forward
                  </span>
                </Link>
                <Link
                  href={isLoggedIn ? "/auctions" : "/auth?mode=signup"}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#d7aa63]/55 bg-black/35 px-7 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  {isLoggedIn ? "VÀO PHÒNG ĐẤU GIÁ" : "ĐĂNG KÝ TÀI KHOẢN"}
                  <span className="material-symbols-outlined text-base">
                    {isLoggedIn ? "gavel" : "person_add"}
                  </span>
                </Link>
              </div>

              <div className="mt-5 grid max-w-xl grid-cols-1 gap-3 text-xs text-white/70 sm:grid-cols-3">
                {["Xem lịch phiên live", "Ưu đãi độc quyền", "Hỗ trợ 24/7"].map(
                  (item) => (
                    <span
                      key={item}
                      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3"
                    >
                      <span className="material-symbols-outlined text-sm text-[#f0c982]">
                        check_circle
                      </span>
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
