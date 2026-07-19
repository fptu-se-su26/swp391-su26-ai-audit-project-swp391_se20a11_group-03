"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useTranslations } from "next-intl";
import BidZoneLogo from "@/components/brand/BidZoneLogo";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
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
  },
  {
    icon: "lock",
  },
  {
    icon: "support_agent",
  },
];

const AUTH_STATS = [
  {
    icon: "workspace_premium",
  },
  {
    icon: "verified_user",
  },
  {
    icon: "diamond",
  },
  {
    icon: "headset_mic",
  },
];

export default function AuthPage({ searchParams }: AuthPageProps) {
  const t = useTranslations("auth");
  const tPage = useTranslations("authPage");
  const tCommon = useTranslations("common");
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
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState("");
  const [googleReady, setGoogleReady] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleGoogleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        setLoginError(tPage("googleCredError"));
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
            : tPage("serverError"),
        );
      } finally {
        setSubmitting(false);
      }
    },
    [redirectAfterAuth, router, tPage],
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    function initGoogle() {
      const google = window.google;
      if (!google || !googleButtonRef.current) return;
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
      });
      google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "filled_black",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        width: 360,
      });
      setGoogleReady(true);
    }

    if (window.google) {
      initGoogle();
      return;
    }

    const script = document.createElement("script");
    script.src = GSI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.head.appendChild(script);
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
          setLoginError(tPage("passwordMismatch"));
          return;
        }
        if (
          password.length < 8 ||
          !/[A-Z]/.test(password) ||
          !/[a-z]/.test(password) ||
          !/\d/.test(password)
        ) {
          setLoginError(tPage("passwordWeak"));
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
          `${t("registerSuccess")}! ${tPage("loginSubtitle")}`,
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
            ? tPage("wrongCredentials")
            : err.message,
        );
      } else {
        setLoginError(tPage("serverError"));
      }
    } finally {
      setSubmitting(false);
    }
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

          <LanguageSwitcher />
        </header>

        <section className="grid flex-1 grid-cols-1 items-center gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start lg:gap-8 lg:py-6 xl:grid-cols-[minmax(0,1fr)_410px]">
          <div className="relative min-h-[500px] overflow-hidden rounded-2xl lg:sticky lg:top-6 lg:h-[min(640px,calc(100dvh-128px))] lg:min-h-[560px]">
            <Image
              src="/images/luxury-watch-hero.webp"
              alt="BidZone premium auction"
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
                  {tPage("heroBadge")}
                </p>
                <h1 className="mt-6 text-4xl font-bold leading-[1.08] text-white sm:text-5xl lg:text-[44px]">
                  {tPage("heroTitle").split("\n").map((line, index) => (
                    <span key={line} className={index === 1 ? "text-[#f0c982]" : undefined}>
                      {index > 0 ? <br /> : null}
                      {line}
                    </span>
                  ))}
                </h1>
                <p className="mt-5 text-sm leading-relaxed text-white/72">
                  {tPage("heroDesc")}
                </p>
              </div>

              <div className="mt-7 grid max-w-[390px] gap-3">
                {TRUST_ITEMS.map((item, index) => (
                  <div key={item.icon} className="flex items-start gap-3">
                    <span className="material-symbols-outlined mt-0.5 text-xl text-[#f0c982]">
                      {item.icon}
                    </span>
                    <span>
                    <span className="block text-xs font-semibold tracking-wider text-white">
                        {tPage(`trust.${index}.title`)}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-white/58">
                        {tPage(`trust.${index}.description`)}
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
                      setEmailOrPhone("");
                      setPassword("");
                      setConfirmPassword("");
                      setLoginError("");
                    }}
                    className={`h-9 w-1/2 rounded-full text-sm font-semibold transition-colors ${
                      mode === item
                        ? "bg-[#f0c982] text-black"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {item === "login" ? t("login") : t("register")}
                  </button>
                ))}
              </div>

              <div className="mt-3 text-center">
                <h2 className="text-xl font-bold tracking-wide text-white xl:text-2xl">
                  {isSignup ? t("register").toUpperCase() : t("login").toUpperCase()}
                </h2>
                <p className="mt-1.5 text-xs text-white/50 xl:text-sm">
                  {isSignup
                    ? tPage("signupSubtitle")
                    : tPage("loginSubtitle")}
                </p>
              </div>

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
                      {t("fullName").toUpperCase()}
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
                        placeholder={tPage("placeholderFullName")}
                        className="auth-input min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                      />
                    </div>
                  </div>
                ) : null}

                {isSignup ? (
                  <div>
                    <label className="text-[11px] font-semibold tracking-wider text-white/75">
                      {t("phone").toUpperCase()}
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
                        placeholder={tPage("placeholderPhone")}
                        className="auth-input min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                      />
                    </div>
                  </div>
                ) : null}

                <div>
                  <label className="text-[11px] font-semibold tracking-wider text-white/75">
                    {tPage("emailOrPhone")}
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
                      placeholder={tPage("placeholderEmailOrPhone")}
                      className="auth-input min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-[11px] font-semibold tracking-wider text-white/75">
                      {t("password").toUpperCase()}
                    </label>
                    {!isSignup ? (
                      <button
                        type="button"
                        className="shrink-0 text-[11px] font-medium text-[#f0c982] hover:text-[#f4d79b]"
                      >
                        {t("forgotPassword")}
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
                      placeholder={tPage("placeholderPassword")}
                      className="auth-input min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((current) => !current)}
                      className="shrink-0 text-white/45 transition-colors hover:text-white"
                      aria-label={showPass ? tPage("hidePassword") : tPage("showPassword")}
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
                      {t("confirmPassword").toUpperCase()}
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
                        placeholder={tPage("placeholderConfirmPassword")}
                        className="auth-input min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPass((current) => !current)
                        }
                        className="shrink-0 text-white/45 transition-colors hover:text-white"
                        aria-label={
                          showConfirmPass ? tPage("hidePassword") : tPage("showPassword")
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
                  {tPage("agreeTerms")}
                </label>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="mt-3 h-10 w-full rounded-lg bg-[#f0c982] text-sm font-bold tracking-wide text-black transition-colors hover:bg-[#f4d79b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? tCommon("loading").toUpperCase()
                  : isSignup
                    ? t("register").toUpperCase()
                    : t("login").toUpperCase()}
              </button>

              <div className="my-3 flex items-center gap-4">
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-[11px] uppercase tracking-wider text-white/35">
                  {isSignup ? tPage("orRegisterWith") : tPage("orLoginWith")}
                </span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <div
                ref={googleButtonRef}
                className={googleReady ? "flex justify-center" : "hidden"}
              />
              {!googleReady ? (
                <button
                  type="button"
                  disabled
                  className="grid h-9 w-full cursor-wait grid-cols-[28px_1fr_28px] items-center rounded-lg border border-white/12 bg-white/[0.02] px-4 text-sm text-white/50"
                >
                  <FcGoogle className="mx-auto text-lg" aria-hidden="true" />
                  <span className="text-center">
                    {isSignup ? tPage("googleRegister") : tPage("googleLogin")}
                  </span>
                  <span aria-hidden="true" />
                </button>
              ) : null}

            </form>
          </div>
        </section>

        <section className="grid shrink-0 gap-3 rounded-lg border border-[#d7aa63]/30 bg-white/[0.02] px-4 py-3 sm:grid-cols-2 lg:grid-cols-4">
          {AUTH_STATS.map((item, index) => (
            <div
              key={item.icon}
              className={`flex items-start gap-2 ${
                index > 0 ? "lg:border-l lg:border-white/10 lg:pl-5" : ""
              }`}
            >
              <span className="material-symbols-outlined text-xl text-[#f0c982]">
                {item.icon}
              </span>
              <span>
                <span className="block text-xs font-semibold tracking-wider text-white">
                  {tPage(`stats.${index}.title`)}
                </span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-white/50">
                  {tPage(`stats.${index}.description`)}
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
