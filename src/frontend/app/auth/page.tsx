"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import BidZoneLogo from "@/components/brand/BidZoneLogo";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { ApiError, authApi, toFrontendRole } from "@/lib/api";

type AuthMode = "login" | "signup";

type AuthPageProps = {
  searchParams: Promise<{ mode?: string; next?: string }>;
};

function safeNextPath(value: string | undefined) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : null;
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

const GSI_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

type GoogleCredentialResponse = { credential?: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>,
          ) => void;
        };
      };
    };
  }
}
type UserRole = "collector" | "seller" | "staff" | "admin";

const ROLE_HOME: Record<UserRole, string> = {
  collector: "/dashboard",
  seller: "/inventory",
  staff: "/staff/approvals",
  admin: "/admin/dashboard",
};

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

export default function AuthPage({ searchParams }: AuthPageProps) {
  const resolvedSearchParams = use(searchParams);
  const router = useRouter();
  const redirectAfterAuth = safeNextPath(resolvedSearchParams.next);
  const [mode, setMode] = useState<AuthMode>(
    resolvedSearchParams.mode === "signup" ? "signup" : "login",
  );
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState("");
  const [googleReady, setGoogleReady] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleGoogleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        setLoginError("Không nhận được thông tin đăng nhập từ Google.");
        return;
      }
      setLoginError("");
      setSubmitting(true);
      try {
        const res = await authApi.googleLogin(response.credential);
        const role = toFrontendRole(res.roleName);
        router.push(redirectAfterAuth ?? ROLE_HOME[role]);
      } catch (err) {
        setLoginError(
          err instanceof ApiError
            ? err.message
            : "Không kết nối được máy chủ. Kiểm tra backend đang chạy ở port 8096.",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [redirectAfterAuth, router],
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    function renderGoogleButton() {
      const google = window.google;
      if (!google || !googleButtonRef.current) return;

      googleButtonRef.current.replaceChildren();
      const isDark = document.documentElement.dataset.theme === "dark";

      google.accounts.id.renderButton(googleButtonRef.current, {
        type: "standard",
        theme: isDark ? "filled_black" : "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        logo_alignment: "left",
        locale: "vi",
        width: Math.min(400, googleButtonRef.current.clientWidth || 400),
      });
    }

    function initGoogle() {
      const google = window.google;
      if (!google || !googleButtonRef.current) return;
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
      });
      renderGoogleButton();
      setGoogleReady(true);
    }

    function handleThemeChange() {
      renderGoogleButton();
    }

    window.addEventListener("bidzone:theme-change", handleThemeChange);

    let script: HTMLScriptElement | null = null;
    if (window.google) {
      initGoogle();
    } else {
      script = document.querySelector<HTMLScriptElement>(
        `script[src="${GSI_SCRIPT_SRC}"]`,
      );

      if (!script) {
        script = document.createElement("script");
        script.src = GSI_SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      script.addEventListener("load", initGoogle);
    }

    return () => {
      window.removeEventListener("bidzone:theme-change", handleThemeChange);
      script?.removeEventListener("load", initGoogle);
    };
  }, [handleGoogleCredential]);

  const isSignup = mode === "signup";

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
      router.push(redirectAfterAuth ?? ROLE_HOME[role]);
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

  return (
    <main className="luxora-app auth-page min-h-screen overflow-x-hidden lg:fixed lg:inset-0 lg:h-dvh lg:min-h-0 lg:w-full lg:overflow-hidden">
      <div className="auth-page__glow auth-page__glow--one" aria-hidden="true" />
      <div className="auth-page__glow auth-page__glow--two" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 sm:px-6 lg:h-full lg:min-h-0 lg:px-10">
        <header className="flex h-20 shrink-0 items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center"
            aria-label="BidZone"
          >
            <BidZoneLogo priority className="h-12 w-auto" />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="auth-back-link hidden h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold sm:inline-flex sm:text-sm"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span className="hidden sm:inline">Về trang chủ</span>
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <section className="auth-layout mb-6 grid flex-1 overflow-hidden rounded-[28px] lg:mb-5 lg:min-h-0 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="theme-dark-content relative hidden min-h-0 overflow-hidden lg:flex">
            <Image
              src="/images/hero-auction-dark-v2.webp"
              alt="Đồng hồ cao cấp BidZone"
              fill
              priority
              sizes="(min-width: 1024px) 56vw, 100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />

            <div className="relative z-10 flex h-full w-full flex-col justify-between p-10 xl:p-14">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 py-2 text-[11px] font-semibold tracking-[0.24em] text-white/70 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f0c982]" />
                VERIFIED AUCTION PLATFORM
              </div>

              <div className="max-w-[520px] py-12">
                <p className="text-xs font-semibold tracking-[0.42em] text-[#f0c982]">
                  LUXURY AUCTION HOUSE
                </p>
                <h1 className="mt-6 text-5xl font-bold leading-[1.02] tracking-[-0.03em] text-white xl:text-6xl">
                  NƠI GIÁ TRỊ
                  <br />
                  <span className="text-[#f0c982]">ĐƯỢC TÔN VINH</span>
                </h1>
                <p className="mt-6 max-w-[460px] text-base leading-7 text-white/68">
                  Tiếp cận những vật phẩm tuyển chọn, hồ sơ minh bạch và trải
                  nghiệm đấu giá trực tuyến được thiết kế cho người sưu tầm.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-white/15 pt-7">
                {TRUST_ITEMS.map((item) => (
                  <div key={item.title} className="min-w-0">
                    <span className="material-symbols-outlined text-xl text-[#f0c982]">
                      {item.icon}
                    </span>
                    <span className="mt-2 block text-[10px] font-semibold tracking-wider text-white xl:text-[11px]">
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="auth-form-pane flex min-h-[calc(100dvh-7rem)] min-w-0 flex-col justify-center px-5 py-8 sm:px-10 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:px-12 lg:py-5 xl:px-16">
            <div className="theme-dark-content relative mb-8 min-h-40 overflow-hidden rounded-2xl p-6 lg:hidden">
              <Image
                src="/images/hero-auction-dark-v2.webp"
                alt="Đồng hồ cao cấp BidZone"
                fill
                sizes="100vw"
                className="object-cover object-[68%_center]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />
              <div className="relative z-10 max-w-[260px]">
                <p className="text-[10px] font-semibold tracking-[0.3em] text-[#f0c982]">
                  BIDZONE
                </p>
                <p className="mt-3 text-2xl font-bold leading-tight text-white">
                  Giá trị thật.
                  <br />Đấu giá minh bạch.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className={`auth-form mx-auto min-w-0 w-full max-w-[470px] ${
                isSignup ? "auth-form--signup" : ""
              }`}
            >
              <p className="text-xs font-semibold tracking-[0.26em] text-[var(--luxora-gold-dark)]">
                TÀI KHOẢN BIDZONE
              </p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-[-0.03em] text-[var(--luxora-text)] sm:text-4xl">
                    {isSignup ? "Tạo tài khoản" : "Chào mừng trở lại"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--luxora-text-muted)]">
                    {isSignup
                      ? "Tham gia cộng đồng đấu giá cao cấp của BidZone."
                      : "Đăng nhập để tiếp tục hành trình sưu tầm của bạn."}
                  </p>
                </div>
              </div>

              <div className="auth-mode-switch mt-7 grid grid-cols-2 rounded-xl p-1">
                {(["login", "signup"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setMode(item);
                      setEmailOrPhone("");
                      setPassword("");
                      setConfirmPassword("");
                      setLoginError("");
                    }}
                    className={`h-11 rounded-lg text-sm font-semibold transition-all ${
                      mode === item
                        ? "auth-mode-switch__active"
                        : "text-[var(--luxora-text-muted)] hover:text-[var(--luxora-text)]"
                    }`}
                  >
                    {item === "login" ? "Đăng nhập" : "Đăng ký"}
                  </button>
                ))}
              </div>

              {loginError ? (
                <p className="mt-5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-600">
                  {loginError}
                </p>
              ) : null}

              {signupSuccess ? (
                <p className="mt-5 rounded-xl border border-green-500/25 bg-green-500/10 px-4 py-3 text-sm text-green-700">
                  {signupSuccess}
                </p>
              ) : null}

              <div className="auth-fields mt-6 space-y-4">
                {isSignup ? (
                  <div>
                    <label className="auth-label">
                      HỌ VÀ TÊN
                    </label>
                    <div className="auth-field">
                      <span className="material-symbols-outlined text-lg text-white/45">
                        person
                      </span>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        placeholder="Nhập họ và tên"
                        className="auth-input min-w-0 flex-1 bg-transparent text-sm text-[var(--luxora-text)] outline-none placeholder:text-[var(--luxora-text-muted)]"
                      />
                    </div>
                  </div>
                ) : null}

                <div>
                  <label className="auth-label">
                    {isSignup ? "EMAIL" : "EMAIL HOẶC SỐ ĐIỆN THOẠI"}
                  </label>
                  <div className="auth-field">
                    <span className="material-symbols-outlined text-lg text-white/45">
                      mail
                    </span>
                    <input
                      type={isSignup ? "email" : "text"}
                      required
                      value={emailOrPhone}
                      onChange={(event) => setEmailOrPhone(event.target.value)}
                      placeholder={
                        isSignup ? "Nhập email" : "Nhập email hoặc số điện thoại"
                      }
                      className="auth-input min-w-0 flex-1 bg-transparent text-sm text-[var(--luxora-text)] outline-none placeholder:text-[var(--luxora-text-muted)]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label className="auth-label">
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
                  <div className="auth-field">
                    <span className="material-symbols-outlined text-lg text-white/45">
                      lock
                    </span>
                    <input
                      type={showPass ? "text" : "password"}
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Nhập mật khẩu"
                      className="auth-input min-w-0 flex-1 bg-transparent text-sm text-[var(--luxora-text)] outline-none placeholder:text-[var(--luxora-text-muted)]"
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
                    <label className="auth-label">
                      XÁC NHẬN MẬT KHẨU
                    </label>
                    <div className="auth-field">
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
                        className="auth-input min-w-0 flex-1 bg-transparent text-sm text-[var(--luxora-text)] outline-none placeholder:text-[var(--luxora-text-muted)]"
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
                <label className="auth-consent mt-4 flex items-start gap-3 text-xs leading-relaxed text-[var(--luxora-text-muted)]">
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
                className="auth-submit mt-6 h-12 w-full rounded-xl bg-[#e2b34f] text-sm font-bold tracking-wide text-[#17130b] shadow-[0_12px_30px_rgba(194,137,38,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#efc66e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "ĐANG XỬ LÝ..."
                  : isSignup
                    ? "TẠO TÀI KHOẢN"
                    : "ĐĂNG NHẬP"}
              </button>

              <div className="auth-social-divider my-5 flex items-center gap-4">
                <span className="auth-divider h-px flex-1" />
                <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--luxora-text-muted)]">
                  {isSignup ? "hoặc đăng ký với" : "hoặc đăng nhập với"}
                </span>
                <span className="auth-divider h-px flex-1" />
              </div>

              <div
                ref={googleButtonRef}
                className={googleReady ? "auth-google-slot flex min-w-0 justify-center overflow-hidden" : "hidden"}
              />
              {!googleReady ? (
                <button
                  type="button"
                  disabled
                  className="auth-google-button mx-auto grid h-11 w-full max-w-[400px] cursor-wait grid-cols-[28px_1fr_28px] items-center rounded-full px-4 text-sm font-medium"
                >
                  <FcGoogle className="mx-auto text-lg" aria-hidden="true" />
                  <span className="text-center">
                    {isSignup ? "Đăng ký với Google" : "Tiếp tục với Google"}
                  </span>
                  <span aria-hidden="true" />
                </button>
              ) : null}

              <p className="auth-security-note mt-6 text-center text-xs leading-5 text-[var(--luxora-text-muted)]">
                Thông tin của bạn được mã hóa và bảo vệ theo tiêu chuẩn bảo mật
                của BidZone.
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
