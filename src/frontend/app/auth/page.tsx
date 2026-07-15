"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import BidZoneLogo from "@/components/brand/BidZoneLogo";
import { ApiError, authApi, toFrontendRole } from "@/lib/api";

type AuthMode = "login" | "signup";
type DemoRole = "collector" | "seller" | "staff" | "admin";

const ROLE_HOME: Record<DemoRole, string> = {
  collector: "/dashboard",
  seller: "/inventory",
  staff: "/staff/approvals",
  admin: "/admin/dashboard",
};

const DEMO_ACCOUNTS: {
  role: DemoRole;
  label: string;
  email: string;
  password: string;
  href: string;
  icon: string;
}[] = [
  {
    role: "collector",
    label: "Collector",
    email: "collector@bidzone.demo",
    password: "Demo@123",
    href: "/dashboard",
    icon: "person_search",
  },
  {
    role: "seller",
    label: "Seller",
    email: "seller@bidzone.demo",
    password: "Demo@123",
    href: "/inventory",
    icon: "storefront",
  },
  {
    role: "staff",
    label: "Staff",
    email: "staff@bidzone.demo",
    password: "Demo@123",
    href: "/staff/approvals",
    icon: "badge",
  },
  {
    role: "admin",
    label: "Admin",
    email: "admin@bidzone.demo",
    password: "Demo@123",
    href: "/admin/dashboard",
    icon: "admin_panel_settings",
  },
];

const TRUST_ITEMS = [
  {
    icon: "verified_user",
    title: "HÀNG THẬT 100%",
    description: "Cam kết chính hãng, kiểm định chặt chẽ.",
  },
  {
    icon: "lock",
    title: "THANH TOÁN AN TOÀN",
    description: "Bảo mật tuyệt đối mọi giao dịch.",
  },
  {
    icon: "support_agent",
    title: "HỖ TRỢ 24/7",
    description: "Đội ngũ chuyên nghiệp luôn sẵn sàng.",
  },
];

const AUTH_STATS = [
  {
    icon: "workspace_premium",
    title: "SẢN PHẨM CAO CẤP",
    description: "Tuyển chọn kỹ lưỡng từ các thương hiệu hàng đầu.",
  },
  {
    icon: "verified_user",
    title: "ĐẤU GIÁ MINH BẠCH",
    description: "Quy trình công khai, công bằng, rõ ràng.",
  },
  {
    icon: "diamond",
    title: "THÀNH VIÊN TOÀN CẦU",
    description: "Cộng đồng đam mê luxury trên toàn thế giới.",
  },
  {
    icon: "headset_mic",
    title: "HỖ TRỢ CHUYÊN NGHIỆP",
    description: "Đội ngũ tư vấn tận tâm, hỗ trợ mọi lúc.",
  },
];

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [selectedDemoRole, setSelectedDemoRole] =
    useState<DemoRole>("collector");
  const [emailOrPhone, setEmailOrPhone] = useState(
    DEMO_ACCOUNTS[0].email,
  );
  const [password, setPassword] = useState(DEMO_ACCOUNTS[0].password);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState("");

  const isSignup = mode === "signup";
  const selectedDemo =
    DEMO_ACCOUNTS.find((account) => account.role === selectedDemoRole) ??
    DEMO_ACCOUNTS[0];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginError("");
    setSignupSuccess("");
    setSubmitting(true);

    try {
      if (isSignup) {
        if (password !== confirmPassword) {
          setLoginError("Mật khẩu xác nhận không khớp.");
          return;
        }
        if (
          password.length < 8 ||
          !/[A-Z]/.test(password) ||
          !/[a-z]/.test(password) ||
          !/\d/.test(password)
        ) {
          setLoginError(
            "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số.",
          );
          return;
        }
        await authApi.register({
          fullName: fullName.trim(),
          email: emailOrPhone.trim(),
          phone: phone.trim(),
          password,
          confirmPassword,
        });
        setSignupSuccess(
          "Tạo tài khoản thành công! Đăng nhập để bắt đầu đấu giá.",
        );
        setMode("login");
        return;
      }

      const res = await authApi.login(emailOrPhone.trim(), password);
      const role = toFrontendRole(res.roleName);
      router.push(ROLE_HOME[role]);
    } catch (err) {
      if (err instanceof ApiError) {
        setLoginError(
          err.status === 401
            ? "Email hoặc mật khẩu không đúng."
            : err.message,
        );
      } else {
        setLoginError(
          "Không kết nối được máy chủ. Kiểm tra backend đang chạy ở port 8096.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  function selectDemoAccount(role: DemoRole) {
    const account =
      DEMO_ACCOUNTS.find((demoAccount) => demoAccount.role === role) ??
      DEMO_ACCOUNTS[0];
    setMode("login");
    setSelectedDemoRole(account.role);
    setEmailOrPhone(account.email);
    setPassword(account.password);
    setLoginError("");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-3">
        <header className="flex shrink-0 items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center"
            aria-label="BidZone"
          >
            <BidZoneLogo priority className="h-12 w-auto" />
          </Link>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-[#d7aa63]/40 px-3 py-2 text-xs text-white/75"
          >
            <span className="material-symbols-outlined text-base text-[#f0c982]">
              language
            </span>
            Tiếng Việt
          </button>
        </header>

        <section className="grid flex-1 grid-cols-1 items-center gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start lg:gap-8 lg:py-6 xl:grid-cols-[minmax(0,1fr)_410px]">
          <div className="relative min-h-[500px] overflow-hidden rounded-2xl lg:sticky lg:top-6 lg:h-[min(640px,calc(100dvh-128px))] lg:min-h-[560px]">
            <Image
              src="/images/luxury-watch-hero.webp"
              alt="Đồng hồ cao cấp BidZone"
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover object-[60%_center]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/68 to-black/5" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/5 to-black" />

            <div className="relative z-10 flex min-h-[500px] flex-col justify-center p-6 sm:p-8 lg:h-full lg:p-9">
              <div className="max-w-[390px]">
                <p className="text-xs font-semibold tracking-[0.42em] text-[#f0c982]">
                  LUXURY AUCTION HOUSE
                </p>
                <h1 className="mt-6 text-4xl font-bold leading-[1.08] text-white sm:text-5xl lg:text-[44px]">
                  NƠI GIÁ TRỊ
                  <br />
                  <span className="text-[#f0c982]">ĐƯỢC TÔN VINH</span>
                </h1>
                <p className="mt-5 text-sm leading-relaxed text-white/72">
                  Khám phá những sản phẩm đẳng cấp, công nghệ, hiếm có từ các
                  thương hiệu hàng đầu thế giới. Đấu giá live mỗi ngày với mức
                  giá tốt nhất.
                </p>
              </div>

              <div className="mt-7 grid max-w-[390px] gap-3">
                {TRUST_ITEMS.map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <span className="material-symbols-outlined mt-0.5 text-xl text-[#f0c982]">
                      {item.icon}
                    </span>
                    <span>
                      <span className="block text-xs font-semibold tracking-wider text-white">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-white/58">
                        {item.description}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-[410px] rounded-2xl border border-[#d7aa63]/35 bg-black/80 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur sm:p-5 lg:max-w-[390px] xl:max-w-[410px]"
            >
              <div className="rounded-full border border-white/10 bg-white/[0.03] p-1">
                {(["login", "signup"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setMode(item);
                      if (item === "signup") {
                        setEmailOrPhone("");
                        setPassword("");
                      } else {
                        setEmailOrPhone(selectedDemo.email);
                        setPassword(selectedDemo.password);
                      }
                    }}
                    className={`h-9 w-1/2 rounded-full text-sm font-semibold transition-colors ${
                      mode === item
                        ? "bg-[#f0c982] text-black"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {item === "login" ? "Đăng nhập" : "Đăng ký"}
                  </button>
                ))}
              </div>

              <div className="mt-3 text-center">
                <h2 className="text-xl font-bold tracking-wide text-white xl:text-2xl">
                  {isSignup ? "ĐĂNG KÝ" : "ĐĂNG NHẬP"}
                </h2>
                <p className="mt-1.5 text-xs text-white/50 xl:text-sm">
                  {isSignup
                    ? "Tạo tài khoản để bắt đầu đấu giá"
                    : "Chào mừng bạn trở lại BidZone"}
                </p>
              </div>

              {!isSignup ? (
                <div className="mt-4 rounded-xl border border-[#d7aa63]/25 bg-[#f0c982]/[0.04] p-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f0c982]">
                      Tài khoản demo
                    </p>
                    <p className="text-[11px] text-white/45">
                      Mật khẩu: Demo@123
                    </p>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {DEMO_ACCOUNTS.map((account) => (
                      <button
                        key={account.role}
                        type="button"
                        onClick={() => selectDemoAccount(account.role)}
                        className={`flex min-h-9 items-center gap-2 rounded-lg border px-3 text-left text-xs font-semibold transition-colors ${
                          selectedDemoRole === account.role
                            ? "border-[#f0c982] bg-[#f0c982] text-black"
                            : "border-white/12 bg-black/40 text-white/65 hover:border-[#f0c982]/60 hover:text-white"
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">
                          {account.icon}
                        </span>
                        {account.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {loginError ? (
                <p className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                  {loginError}
                </p>
              ) : null}

              {signupSuccess ? (
                <p className="mt-3 rounded-lg border border-green-400/30 bg-green-500/10 px-3 py-2 text-xs text-green-200">
                  {signupSuccess}
                </p>
              ) : null}

              <div className="mt-3 space-y-2.5">
                {isSignup ? (
                  <div>
                    <label className="text-[11px] font-semibold tracking-wider text-white/75">
                      HỌ VÀ TÊN
                    </label>
                    <div className="mt-1.5 flex h-9 items-center gap-3 rounded-lg border border-white/12 bg-[#050505] px-4 focus-within:border-[#f0c982]/70">
                      <span className="material-symbols-outlined text-lg text-white/45">
                        person
                      </span>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        placeholder="Nhập họ và tên"
                        className="auth-input min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                      />
                    </div>
                  </div>
                ) : null}

                {isSignup ? (
                  <div>
                    <label className="text-[11px] font-semibold tracking-wider text-white/75">
                      SỐ ĐIỆN THOẠI
                    </label>
                    <div className="mt-1.5 flex h-9 items-center gap-3 rounded-lg border border-white/12 bg-[#050505] px-4 focus-within:border-[#f0c982]/70">
                      <span className="material-symbols-outlined text-lg text-white/45">
                        call
                      </span>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="Nhập số điện thoại"
                        className="auth-input min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                      />
                    </div>
                  </div>
                ) : null}

                <div>
                  <label className="text-[11px] font-semibold tracking-wider text-white/75">
                    EMAIL HOẶC SỐ ĐIỆN THOẠI
                  </label>
                  <div className="mt-1.5 flex h-9 items-center gap-3 rounded-lg border border-white/12 bg-[#050505] px-4 focus-within:border-[#f0c982]/70">
                    <span className="material-symbols-outlined text-lg text-white/45">
                      mail
                    </span>
                    <input
                      type="text"
                      required
                      value={emailOrPhone}
                      onChange={(event) => setEmailOrPhone(event.target.value)}
                      placeholder="Nhập email hoặc số điện thoại"
                      className="auth-input min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-[11px] font-semibold tracking-wider text-white/75">
                      MẬT KHẨU
                    </label>
                    {!isSignup ? (
                      <button
                        type="button"
                        className="shrink-0 text-[11px] font-medium text-[#f0c982] hover:text-[#f4d79b]"
                      >
                        Quên mật khẩu?
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-1.5 flex h-9 items-center gap-3 rounded-lg border border-white/12 bg-[#050505] px-4 focus-within:border-[#f0c982]/70">
                    <span className="material-symbols-outlined text-lg text-white/45">
                      lock
                    </span>
                    <input
                      type={showPass ? "text" : "password"}
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Nhập mật khẩu"
                      className="auth-input min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((current) => !current)}
                      className="shrink-0 text-white/45 transition-colors hover:text-white"
                      aria-label={showPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPass ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {isSignup ? (
                  <div>
                    <label className="text-[11px] font-semibold tracking-wider text-white/75">
                      XÁC NHẬN MẬT KHẨU
                    </label>
                    <div className="mt-1.5 flex h-9 items-center gap-3 rounded-lg border border-white/12 bg-[#050505] px-4 focus-within:border-[#f0c982]/70">
                      <span className="material-symbols-outlined text-lg text-white/45">
                        lock_reset
                      </span>
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        placeholder="Nhập lại mật khẩu"
                        className="auth-input min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPass((current) => !current)
                        }
                        className="shrink-0 text-white/45 transition-colors hover:text-white"
                        aria-label={
                          showConfirmPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                        }
                      >
                        <span className="material-symbols-outlined text-lg">
                          {showConfirmPass ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              {isSignup ? (
                <label className="mt-2.5 flex items-start gap-3 text-xs leading-relaxed text-white/50">
                  <input
                    type="checkbox"
                    required
                    className="mt-0.5 h-4 w-4 accent-[#f0c982]"
                  />
                  Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật của
                  BidZone.
                </label>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="mt-3 h-10 w-full rounded-lg bg-[#f0c982] text-sm font-bold tracking-wide text-black transition-colors hover:bg-[#f4d79b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "ĐANG XỬ LÝ..."
                  : isSignup
                    ? "TẠO TÀI KHOẢN"
                    : "ĐĂNG NHẬP"}
              </button>

              <div className="my-3 flex items-center gap-4">
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-[11px] uppercase tracking-wider text-white/35">
                  {isSignup ? "hoặc đăng ký với" : "hoặc đăng nhập với"}
                </span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <button
                type="button"
                className="grid h-9 w-full grid-cols-[28px_1fr_28px] items-center rounded-lg border border-white/12 bg-white/[0.02] px-4 text-sm text-white/75 transition-colors hover:border-white/25 hover:bg-white/[0.05]"
              >
                <FcGoogle className="mx-auto text-lg" aria-hidden="true" />
                <span className="text-center">
                  {isSignup ? "Đăng ký với Google" : "Tiếp tục với Google"}
                </span>
                <span aria-hidden="true" />
              </button>

            </form>
          </div>
        </section>

        <section className="grid shrink-0 gap-3 rounded-lg border border-[#d7aa63]/30 bg-white/[0.02] px-4 py-3 sm:grid-cols-2 lg:grid-cols-4">
          {AUTH_STATS.map((item, index) => (
            <div
              key={item.title}
              className={`flex items-start gap-2 ${
                index > 0 ? "lg:border-l lg:border-white/10 lg:pl-5" : ""
              }`}
            >
              <span className="material-symbols-outlined text-xl text-[#f0c982]">
                {item.icon}
              </span>
              <span>
                <span className="block text-xs font-semibold tracking-wider text-white">
                  {item.title}
                </span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-white/50">
                  {item.description}
                </span>
              </span>
            </div>
          ))}
        </section>

        <footer className="mt-5 flex shrink-0 flex-col gap-4 border-t border-white/10 py-4 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between lg:hidden">
          <div>
            <Link
              href="/"
              className="inline-flex items-center"
              aria-label="BidZone"
            >
              <BidZoneLogo className="h-12 w-auto" />
            </Link>
            <p className="mt-3">© 2024 BidZone. All rights reserved.</p>
          </div>
          <div className="flex gap-4">
            {["f", "ig", "yt"].map((item) => (
              <span
                key={item}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-[10px] font-semibold uppercase text-white/65"
              >
                {item}
              </span>
            ))}
          </div>
        </footer>
      </div>
    </main>
  );
}
