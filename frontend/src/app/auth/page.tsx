"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { googleLogin, login, register, selectRole } from "@/lib/services/authService";
import { saveStoredUser, StoredUser, getStoredUser, isAdmin } from "@/lib/userSession";
import { ADMIN_HOME } from "@/lib/roleRouting";
import { useTranslations } from "@/i18n/I18nProvider";
import { DEMO_MODE } from "@/lib/demoMode";
import BrandLogo from "@/components/ui/BrandLogo";
import LanguageSwitcher from "@/components/features/LanguageSwitcher";
import { GoldButton, OutlineButton } from "@/components/luxe/primitives";
import { displayFont } from "@/components/luxe/theme";

const WATCH_HERO =
  "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=1600&auto=format&fit=crop";

const TRUST_ITEMS = [
  { icon: "verified_user", title: "HÀNG THẬT 100%", description: "Cam kết chính hãng, kiểm định chặt chẽ." },
  { icon: "lock", title: "THANH TOÁN AN TOÀN", description: "Bảo mật tuyệt đối mọi giao dịch." },
  { icon: "support_agent", title: "HỖ TRỢ 24/7", description: "Đội ngũ chuyên nghiệp luôn sẵn sàng." },
] as const;

const AUTH_STATS = [
  { icon: "workspace_premium", title: "SẢN PHẨM CAO CẤP", description: "Tuyển chọn kỹ lưỡng từ các thương hiệu hàng đầu." },
  { icon: "verified_user", title: "ĐẤU GIÁ MINH BẠCH", description: "Quy trình công khai, công bằng, rõ ràng." },
  { icon: "diamond", title: "THÀNH VIÊN TOÀN CẦU", description: "Cộng đồng đam mê luxury trên toàn thế giới." },
  { icon: "headset_mic", title: "HỖ TRỢ CHUYÊN NGHIỆP", description: "Đội ngũ tư vấn tận tâm, hỗ trợ mọi lúc." },
] as const;

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

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

export default function AuthPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const [mode, setMode] = useState<"login" | "signup" | "select-role">("login");
  const [showPass, setShowPass] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<StoredUser | null>(null);
  const [selectedDemo, setSelectedDemo] = useState<"collector" | "seller" | "staff" | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const isLogin = mode === "login";
  const isSignup = mode === "signup";
  const isSelectRole = mode === "select-role";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "signup") {
      setMode("signup");
    }
    if (params.get("reason") === "session_expired") {
      setErrorMessage("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
  }, []);

  useEffect(() => {
    const user = getStoredUser();
    if (user && isAdmin(user)) {
      router.replace(ADMIN_HOME);
    }
  }, [router]);

  async function handleGoogleCredential(credential: string) {
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await googleLogin(credential);
      if (!response.token) {
        throw new Error(t("errors.noToken"));
      }

      const userData: StoredUser = {
        userId: response.userId,
        username: response.username,
        email: response.email,
        roleName: response.roleName,
        status: response.status,
        token: response.token,
        identityVerified: response.identityVerified,
        profileStatus: response.profileStatus,
      };

      if (response.newUser) {
        // First-time Google account: let them pick Buyer vs Seller, like email signup.
        setPendingGoogleUser(userData);
        setSuccessMessage(t("errors.createSuccess"));
        setMode("select-role");
        return;
      }

      localStorage.setItem("token", response.token);
      saveStoredUser(userData);
      router.push(getRedirectPath(response.roleName));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t("errors.invalidCredentials"));
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || isSelectRole) {
      return;
    }

    let cancelled = false;

    function renderGoogleButton() {
      if (cancelled || !window.google || !googleButtonRef.current) {
        return;
      }
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response.credential) {
            void handleGoogleCredential(response.credential);
          }
        },
      });
      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        text: isLogin ? "signin_with" : "signup_with",
        shape: "rectangular",
        logo_alignment: "center",
        width: 400,
      });
    }

    const existing = document.getElementById("google-gsi-script");
    if (existing) {
      renderGoogleButton();
      return () => {
        cancelled = true;
      };
    }

    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.body.appendChild(script);

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogin, mode]);

  async function handleDemoGoogle() {
    await handleGoogleCredential("demo");
  }

  function getRedirectPath(roleName?: string) {
    const role = roleName?.toLowerCase();

    if (role?.includes("admin")) {
      return "/admin/dashboard";
    }

    if (role?.includes("staff")) {
      return "/staff/approvals";
    }

    // Buyers and sellers land on their own dashboard after signing in
    // (the root "/" now shows the guest landing page).
    return "/dashboard";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    setIsSubmitting(true);

    try {
      if (isSignup) {
        const response = await register({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          confirmPassword,
        });

        if (!response.success) {
          throw new Error(response.message || t("errors.registrationFailed"));
        }

        setSuccessMessage(response.message || t("errors.createSuccess"));
        // Store temp credentials and go to role selection
        localStorage.setItem("pending_email", email);
        localStorage.setItem("pending_password", password);
        setMode("select-role");
        return;
      }

      const response = await login({
        usernameOrEmail: email.trim(),
        password,
      });

      if (!response.token) {
        throw new Error(t("errors.noToken"));
      }

      localStorage.setItem("token", response.token);
      saveStoredUser(response);
      router.push(getRedirectPath(response.roleName));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t("errors.invalidCredentials"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSelectRole(role: "BUYER" | "SELLER") {
    setIsSubmitting(true);
    try {
      // Google sign-up: the account already exists with a valid token, so we just
      // update its role server-side (no password re-login is possible).
      if (pendingGoogleUser) {
        const dbRole = role === "SELLER" ? "Seller" : "User";
        const selectRoleResponse = await selectRole({
          userId: pendingGoogleUser.userId as number,
          role: dbRole,
        });

        if (!selectRoleResponse.success) {
          throw new Error(selectRoleResponse.message || t("errors.selectRoleFailed"));
        }

        const updatedUser: StoredUser = {
          ...pendingGoogleUser,
          roleName: selectRoleResponse.roleName ?? dbRole,
        };

        localStorage.setItem("token", updatedUser.token as string);
        saveStoredUser(updatedUser);
        setPendingGoogleUser(null);
        router.push(getRedirectPath(updatedUser.roleName));
        return;
      }

      const pendingEmail = localStorage.getItem("pending_email") || email;
      const pendingPassword = localStorage.getItem("pending_password") || password;

      const response = await login({
        usernameOrEmail: pendingEmail,
        password: pendingPassword,
      });

      if (!response.token) {
        throw new Error(t("errors.loginAfterRoleFailed"));
      }

      const dbRole = role === "SELLER" ? "Seller" : "User";
      const selectRoleResponse = await selectRole({
        userId: response.userId,
        role: dbRole,
      });

      if (!selectRoleResponse.success) {
        throw new Error(selectRoleResponse.message || t("errors.selectRoleFailed"));
      }

      const loginAfterRole = await login({
        usernameOrEmail: pendingEmail,
        password: pendingPassword,
      });

      if (!loginAfterRole.token) {
        throw new Error(t("errors.refreshSessionFailed"));
      }

      localStorage.removeItem("pending_email");
      localStorage.removeItem("pending_password");

      const userData: StoredUser = {
        userId: loginAfterRole.userId,
        username: loginAfterRole.username,
        email: loginAfterRole.email,
        roleName: loginAfterRole.roleName,
        status: loginAfterRole.status,
        token: loginAfterRole.token,
        identityVerified: loginAfterRole.identityVerified,
        profileStatus: loginAfterRole.profileStatus,
      };

      localStorage.setItem("token", loginAfterRole.token);
      saveStoredUser(userData);

      router.push(getRedirectPath(loginAfterRole.roleName));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t("errors.registrationFlowFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="luxe-page min-h-screen overflow-x-hidden text-[#f5ead9]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-3">
        <header className="flex shrink-0 items-center justify-between">
          <BrandLogo href="/" inverted />
          <div className="auth-lang-dark">
            <LanguageSwitcher />
          </div>
        </header>

        <section className="grid flex-1 grid-cols-1 items-center gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_410px] lg:items-start lg:gap-10 lg:py-6">
          {/* Left hero */}
          <div className="relative hidden min-h-[500px] overflow-hidden rounded-2xl lg:block lg:sticky lg:top-6 lg:h-[min(640px,calc(100dvh-128px))]">
            <img
              src={WATCH_HERO}
              alt="Luxury watch"
              className="absolute inset-0 h-full w-full object-cover object-[60%_center]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
            <div className="relative z-10 flex h-full flex-col justify-center p-8 lg:p-10">
              <div className="max-w-[420px]">
                <p className="text-xs font-bold uppercase tracking-[0.42em] text-[#f0c982]">Luxury Auction House</p>
                <h1 className={`${displayFont} mt-6 text-4xl font-semibold leading-[1.08] text-white lg:text-[44px]`}>
                  NƠI GIÁ TRỊ
                  <br />
                  <span className="text-[#f0c982]">ĐƯỢC TÔN VINH</span>
                </h1>
                <p className="mt-5 text-sm leading-relaxed text-white/72">{t("heroTagline")}</p>
              </div>
              <div className="mt-8 grid max-w-[420px] gap-4">
                {TRUST_ITEMS.map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <span className="material-symbols-outlined mt-0.5 text-xl text-[#f0c982]">{item.icon}</span>
                    <span>
                      <span className="block text-xs font-bold tracking-wider text-white">{item.title}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-white/55">{item.description}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right form */}
          <div className="flex justify-center lg:justify-end">
            {isSelectRole ? (
              <div className="w-full max-w-[410px] rounded-2xl border border-[#d7aa63]/35 bg-black/80 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur sm:p-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-[#d4aa61]/30 bg-[#d4aa61]/10">
                    <span className="material-symbols-outlined text-3xl text-[#f0c982]">how_to_reg</span>
                  </div>
                  <h2 className={`${displayFont} text-2xl font-semibold text-white`}>{t("chooseRole")}</h2>
                  <p className="mt-2 text-sm text-white/55">{t("chooseRoleDesc")}</p>
                </div>

                {successMessage && (
                  <div className="mt-4 rounded-lg border border-[#d4aa61]/30 bg-[#d4aa61]/10 px-4 py-3 text-sm text-[#f0d98b]">
                    {successMessage}
                  </div>
                )}

                <div className="mt-5 space-y-3">
                  <button
                    type="button"
                    onClick={() => handleSelectRole("BUYER")}
                    disabled={isSubmitting}
                    className="group w-full rounded-xl border border-white/10 bg-white/[.03] p-4 text-left transition hover:border-[#d4aa61]/50 hover:bg-[#d4aa61]/[0.06] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#f0ce88] to-[#c99a4b] text-[#100d08]">
                        <span className="material-symbols-outlined text-2xl">shopping_bag</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{t("buyerTitle")}</h3>
                        <p className="text-sm text-white/55">{t("buyerDesc")}</p>
                      </div>
                      <span className="material-symbols-outlined text-[#f0c982] transition group-hover:translate-x-1">arrow_forward</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectRole("SELLER")}
                    disabled={isSubmitting}
                    className="group w-full rounded-xl border border-white/10 bg-white/[.03] p-4 text-left transition hover:border-[#d4aa61]/50 hover:bg-[#d4aa61]/[0.06] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#d4aa61]/40 bg-[#d4aa61]/10 text-[#f0c982]">
                        <span className="material-symbols-outlined text-2xl">sell</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{t("sellerTitle")}</h3>
                        <p className="text-sm text-white/55">{t("sellerDesc")}</p>
                      </div>
                      <span className="material-symbols-outlined text-[#f0c982] transition group-hover:translate-x-1">arrow_forward</span>
                    </div>
                  </button>
                </div>

                {errorMessage && (
                  <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMessage("");
                    setPendingGoogleUser(null);
                    localStorage.removeItem("pending_email");
                    localStorage.removeItem("pending_password");
                  }}
                  className="mt-5 w-full text-center text-sm text-white/55 transition hover:text-[#f0c982]"
                >
                  {t("backToLogin")}
                </button>
              </div>
            ) : (
              <div className="w-full max-w-[410px] rounded-2xl border border-[#d7aa63]/35 bg-black/80 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur sm:p-5">
                <div className="rounded-full border border-white/10 bg-white/[0.03] p-1">
                  {(["login", "signup"] as const).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => {
                        setMode(m);
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      className={`h-9 w-1/2 rounded-full text-sm font-semibold transition-colors ${
                        mode === m ? "bg-[#f0c982] text-[#100d08]" : "text-white/60 hover:text-white"
                      }`}
                    >
                      {m === "login" ? t("logIn") : t("createAccount")}
                    </button>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <h2 className={`${displayFont} text-xl font-semibold tracking-wide text-white sm:text-2xl`}>
                    {isLogin ? t("logIn").toUpperCase() : t("createAccount").toUpperCase()}
                  </h2>
                  <p className="mt-1.5 text-xs text-white/50 sm:text-sm">
                    {isLogin ? t("welcomeBackDesc") : t("joinCollectionDesc")}
                  </p>
                </div>

                {DEMO_MODE && isLogin && (
                  <div className="mt-4 rounded-xl border border-[#d7aa63]/25 bg-[#f0c982]/[0.04] p-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f0c982]">
                        Demo Mode
                      </p>
                      <p className="text-[11px] text-white/45">Mật khẩu: <strong>demo123</strong></p>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {(
                        [
                          { key: "collector" as const, label: "Collector demo", email: "demo@luxeauction.vn", icon: "person_search" },
                          { key: "seller" as const, label: "Seller demo", email: "seller@luxeauction.vn", icon: "storefront" },
                          { key: "staff" as const, label: "Staff demo", email: "staff@luxeauction.vn", icon: "badge" },
                        ] as const
                      ).map((demo) => (
                        <button
                          key={demo.key}
                          type="button"
                          onClick={() => {
                            setEmail(demo.email);
                            setPassword("demo123");
                            setSelectedDemo(demo.key);
                          }}
                          className={`flex min-h-9 items-center gap-2 rounded-lg border px-3 text-left text-xs font-semibold transition-colors ${
                            selectedDemo === demo.key
                              ? "border-[#f0c982] bg-[#f0c982] text-[#100d08]"
                              : "border-white/12 bg-black/40 text-white/65 hover:border-[#f0c982]/60 hover:text-white"
                          } ${demo.key === "staff" ? "col-span-2" : ""}`}
                        >
                          <span className="material-symbols-outlined text-base">{demo.icon}</span>
                          {demo.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
                  {isSignup && (
                    <div>
                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#d4aa61]">
                        {t("fullName")}
                      </label>
                      <input
                        type="text"
                        placeholder={t("fullNamePlaceholder")}
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        autoComplete="name"
                        required={isSignup}
                        className="luxe-input"
                      />
                    </div>
                  )}

                  {isSignup && (
                    <div>
                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#d4aa61]">
                        {t("phone")}
                      </label>
                      <input
                        type="tel"
                        placeholder={t("phonePlaceholder")}
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        autoComplete="tel"
                        required={isSignup}
                        className="luxe-input"
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#d4aa61]">
                      {t("email")}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#9d948a]">
                        mail
                      </span>
                      <input
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        required
                        className="luxe-input pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#d4aa61]">
                        {t("password")}
                      </label>
                      {isLogin && (
                        <a href="#" className="text-[11px] text-[#f0c982]/80 hover:text-[#f0c982] hover:underline">
                          {t("forgotPassword")}
                        </a>
                      )}
                    </div>
                    <div className="relative">
                      <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#9d948a]">
                        lock
                      </span>
                      <input
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete={isLogin ? "current-password" : "new-password"}
                        required
                        placeholder="••••••••"
                        className="luxe-input pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9d948a] hover:text-[#f0c982]"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPass ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {isSignup && (
                    <div>
                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#d4aa61]">
                        {t("confirmPassword")}
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        autoComplete="new-password"
                        required={isSignup}
                        placeholder="••••••••"
                        className="luxe-input"
                      />
                    </div>
                  )}

                  {successMessage && !isSignup && (
                    <div className="rounded-lg border border-[#d4aa61]/30 bg-[#d4aa61]/10 px-4 py-3 text-sm text-[#f0d98b]">
                      {successMessage}
                    </div>
                  )}

                  {errorMessage && (
                    <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {errorMessage}
                    </div>
                  )}

                  <GoldButton
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting
                      ? isLogin
                        ? t("loggingIn")
                        : t("creatingAccount")
                      : isLogin
                        ? t("loginSubmit")
                        : t("signupSubmit")}
                  </GoldButton>
                </form>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.14em]">
                    <span className="bg-black/80 px-3 text-white/45">{t("orContinueWith")}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  {GOOGLE_CLIENT_ID ? (
                    <div ref={googleButtonRef} className="flex w-full justify-center min-h-[44px]" />
                  ) : (
                    <OutlineButton
                      type="button"
                      onClick={handleDemoGoogle}
                      disabled={isSubmitting}
                      className="w-full gap-2"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      {t("continueWithGoogle")}
                    </OutlineButton>
                  )}
                  {!GOOGLE_CLIENT_ID && !DEMO_MODE && (
                    <p className="text-center text-[11px] text-white/40">{t("googleNotConfigured")}</p>
                  )}
                </div>

                <p className="mt-5 text-center text-[11px] leading-relaxed text-white/40">
                  {t("termsPrefix")}{" "}
                  <a className="text-[#f0c982]/80 underline hover:text-[#f0c982]" href="#">
                    {t("terms")}
                  </a>{" "}
                  {t("and")}{" "}
                  <a className="text-[#f0c982]/80 underline hover:text-[#f0c982]" href="#">
                    {t("auctionRules")}
                  </a>
                  .
                </p>
              </div>
            )}
          </div>
        </section>

        <footer className="hidden shrink-0 border-t border-white/10 py-5 lg:grid lg:grid-cols-4 lg:gap-6">
          {AUTH_STATS.map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <span className="material-symbols-outlined text-xl text-[#f0c982]">{item.icon}</span>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-white">{item.title}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-white/45">{item.description}</p>
              </div>
            </div>
          ))}
        </footer>
      </div>
    </main>
  );
}
