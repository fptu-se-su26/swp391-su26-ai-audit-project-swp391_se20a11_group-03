"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import BidZoneLogo from "@/components/brand/BidZoneLogo";
import { ApiError, authApi } from "@/lib/api";

type VerifyEmailPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token } = use(searchParams);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Đang xác minh địa chỉ email...");

  useEffect(() => {
    if (!token) {
      Promise.resolve().then(() => {
        setStatus("error");
        setMessage("Liên kết xác minh không hợp lệ.");
      });
      return;
    }

    let active = true;
    authApi
      .verifyEmail(token)
      .then((response) => {
        if (!active) return;
        setStatus("success");
        setMessage(response.message);
      })
      .catch((error) => {
        if (!active) return;
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "Không thể xác minh email. Vui lòng thử lại.",
        );
      });
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-[#d7aa63]/35 bg-white/[0.03] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        <Link href="/" aria-label="BidZone" className="inline-flex">
          <BidZoneLogo priority className="h-12 w-auto" />
        </Link>
        <div
          className={`mx-auto mt-8 grid size-16 place-items-center rounded-full ${
            status === "success"
              ? "bg-green-500/10 text-green-300"
              : status === "error"
                ? "bg-red-500/10 text-red-300"
                : "bg-[#f0c982]/10 text-[#f0c982]"
          }`}
        >
          <span className="material-symbols-outlined text-3xl">
            {status === "success"
              ? "mark_email_read"
              : status === "error"
                ? "error"
                : "hourglass_top"}
          </span>
        </div>
        <h1 className="mt-5 text-2xl font-bold">Xác minh email</h1>
        <p className="mt-3 text-sm leading-6 text-white/55">{message}</p>
        {status !== "loading" && (
          <Link
            href="/auth"
            className="mt-7 inline-flex w-full justify-center rounded-full bg-[#f0c982] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#f4d79b]"
          >
            {status === "success" ? "Đăng nhập" : "Quay lại đăng ký"}
          </Link>
        )}
      </div>
    </main>
  );
}
