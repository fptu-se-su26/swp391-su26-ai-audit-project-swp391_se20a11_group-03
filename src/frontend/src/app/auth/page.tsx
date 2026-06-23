"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { googleLogin, login, register, selectRole } from "@/lib/services/authService";
import { saveStoredUser, StoredUser } from "@/lib/userSession";
import { useTranslations } from "@/i18n/I18nProvider";
import { DEMO_MODE } from "@/lib/demoMode";

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
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const isLogin = mode === "login";
  const isSignup = mode === "signup";
  const isSelectRole = mode === "select-role";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "signup") {
      setMode("signup");
    }
  }, []);

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
        theme: "outline",
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

    // Both buyer and seller land on the home page; they can navigate
    // to dashboard / post-item via the nav menus.
    return "/";
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
    <main className="flex h-screen overflow-hidden">
      {/* Left: Hero */}
      <section className="hidden lg:flex lg:w-1/2 relative flex-col justify-end p-lg overflow-hidden">
        <div className="absolute inset-0 bg-primary-container">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0_QH_jlR5knRFMIzliDGgOx7IevRtXO86U-bV1eC5yp0vN_mU8rMMBu6rp0xfOvOMnLLTNAmmeyZ-Hgn2KzXRgr32O4Mk6STYqCaN8-GXPmB2YFM1FqTInWHyrJ3IbzP7bPcNb18zk62zl8Mv-CILX_75WIJQRWBTrpVi2nm84LoTk-1sVdi5O6kudZF1oj9AJ83P3zGe8HD97zTlepjT9XoyscVPA6dprYAId1yy95lPDzU_uee4r7_8tW4Umvw-fL7ZI15STdLl"
            alt="Luxury Watch"
            className="w-full h-full object-cover grayscale opacity-60"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(13,28,50,0.2) 0%, rgba(13,28,50,0.8) 100%)" }} />
        </div>
        <div className="relative z-10 max-w-lg">
          <div className="mb-sm">
            <span className="text-secondary font-headline-md text-headline-md font-bold tracking-widest uppercase">{t("appName")}</span>
          </div>
          <h2 className="text-[34px] font-bold leading-tight text-on-primary-fixed mb-sm italic">
            {t("tagline")}
          </h2>
          <div className="w-16 h-1 bg-secondary mb-md" />
          <p className="font-body-md text-on-primary-fixed opacity-70">
            {t("heroTagline")}
          </p>
        </div>
        <div className="absolute -bottom-24 -right-24 opacity-5">
          <span className="material-symbols-outlined text-[300px]" style={{ fontVariationSettings: "'wght' 100" }}>gavel</span>
        </div>
      </section>

      {/* Right: Auth form */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-md bg-surface-container-lowest overflow-hidden">
        <div className="w-full max-w-[460px] flex flex-col">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-md flex-shrink-0">
            <span className="text-primary font-headline-md text-headline-md font-extrabold tracking-tight">{t("appName")}</span>
          </div>

          {/* Role Selection Screen */}
          {isSelectRole && (
            <div className="bg-surface p-md rounded-xl shadow-sm border border-outline-variant/30 flex flex-col">
              <div className="text-center mb-sm">
                <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-md">
                  <span className="material-symbols-outlined text-3xl text-secondary">how_to_reg</span>
                </div>
                <h1 className="text-[26px] font-bold text-primary mb-xs">{t("chooseRole")}</h1>
                <p className="text-sm text-on-surface-variant">
                  {t("chooseRoleDesc")}
                </p>
              </div>

              {successMessage && (
                <div className="mb-md rounded-lg border border-secondary/30 bg-secondary/10 px-4 py-3 text-label-md text-secondary">
                  {successMessage}
                </div>
              )}

              <div className="space-y-3 mt-4">
                {/* Buyer Option */}
                <button
                  onClick={() => handleSelectRole("BUYER")}
                  disabled={isSubmitting}
                  className="w-full p-4 rounded-xl border-2 border-outline-variant hover:border-secondary transition-all text-left group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-primary">shopping_bag</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-headline-sm text-headline-sm text-primary group-hover:text-secondary transition-colors">
                        {t("buyerTitle")}
                      </h3>
                      <p className="text-sm text-on-surface-variant">{t("buyerDesc")}</p>
                    </div>
                    <span className="material-symbols-outlined text-secondary group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </button>

                {/* Seller Option */}
                <button
                  onClick={() => handleSelectRole("SELLER")}
                  disabled={isSubmitting}
                  className="w-full p-4 rounded-xl border-2 border-outline-variant hover:border-secondary transition-all text-left group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-tertiary-container rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-tertiary">sell</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-headline-sm text-headline-sm text-primary group-hover:text-secondary transition-colors">
                        {t("sellerTitle")}
                      </h3>
                      <p className="text-sm text-on-surface-variant">{t("sellerDesc")}</p>
                    </div>
                    <span className="material-symbols-outlined text-secondary group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </button>
              </div>

              {errorMessage && (
                <div className="mt-4 rounded-lg border border-error/30 bg-error-container/20 px-4 py-3 text-label-md text-error">
                  {errorMessage}
                </div>
              )}

              <button
                onClick={() => {
                  setMode("login");
                  setErrorMessage("");
                  setPendingGoogleUser(null);
                  localStorage.removeItem("pending_email");
                  localStorage.removeItem("pending_password");
                }}
                className="mt-4 text-center text-label-md text-on-surface-variant hover:text-secondary transition-colors"
              >
                {t("backToLogin")}
              </button>
            </div>
          )}

          {/* Login/Signup Form */}
          {!isSelectRole && (
            <div className="bg-surface p-md rounded-xl shadow-sm border border-outline-variant/30 flex flex-col">
              {/* Toggle */}
              <div className="flex p-xs bg-surface-container-low rounded-lg mb-sm flex-shrink-0">
                {(["login", "signup"] as const).map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => {
                      setMode(m);
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    className={`flex-1 py-2 text-label-md font-label-md rounded-md transition-all ${
                      mode === m
                        ? "bg-surface shadow-sm text-primary"
                        : "text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    {m === "login" ? t("logIn") : t("createAccount")}
                  </button>
                ))}
              </div>

              <div className="text-center mb-sm flex-shrink-0">
                <h1 className="text-[26px] font-bold text-primary mb-xs">
                  {isLogin ? t("welcomeBack") : t("joinCollection")}
                </h1>
                <p className="text-sm text-on-surface-variant">
                  {isLogin
                    ? t("welcomeBackDesc")
                    : t("joinCollectionDesc")}
                </p>
              </div>

              {DEMO_MODE && isLogin && (
                <div className="mb-3 rounded-xl border border-[#c6a75c]/35 bg-[#f5edd9] p-3 text-xs text-[#604914]">
                  <div className="flex items-center gap-2 font-bold"><span className="material-symbols-outlined text-[17px]">science</span>Demo Mode — không cần backend/database</div>
                  <p className="mt-1 text-[11px] text-[#7a6330]">Mật khẩu cho cả hai tài khoản: <strong>demo123</strong></p>
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={() => { setEmail("demo@luxeauction.vn"); setPassword("demo123"); }} className="rounded-full bg-[#071626] px-3 py-1.5 text-[10px] font-bold text-[#e4c77b]">Collector demo</button>
                    <button type="button" onClick={() => { setEmail("seller@luxeauction.vn"); setPassword("demo123"); }} className="rounded-full border border-[#9b7932] px-3 py-1.5 text-[10px] font-bold">Seller demo</button>
                    <button type="button" onClick={() => { setEmail("staff@luxeauction.vn"); setPassword("demo123"); }} className="rounded-full border border-[#9b7932] px-3 py-1.5 text-[10px] font-bold">Staff demo</button>
                  </div>
                </div>
              )}

              {/* Form */}
              <form className="space-y-2.5" onSubmit={handleSubmit}>
                {isSignup && (
                  <div>
                    <label className="block text-sm font-semibold text-on-surface-variant mb-1">{t("fullName")}</label>
                    <input
                      type="text"
                      placeholder={t("fullNamePlaceholder")}
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      autoComplete="name"
                      required={isSignup}
                      className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-outline-variant/60"
                    />
                  </div>
                )}

                {isSignup && (
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-on-surface-variant mb-1">{t("phone")}</label>
                      <input
                        type="tel"
                        placeholder={t("phonePlaceholder")}
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        autoComplete="tel"
                        required={isSignup}
                        className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-outline-variant/60"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-1">{t("email")}</label>
                  <input
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-outline-variant/60"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-semibold text-on-surface-variant">{t("password")}</label>
                    {isLogin && (
                      <a href="#" className="text-label-sm font-label-sm text-secondary hover:underline">{t("forgotPassword")}</a>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      required
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-outline-variant/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface-variant"
                    >
                      <span className="material-symbols-outlined text-[20px]">{showPass ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>

                {isSignup && (
                  <div>
                    <label className="block text-sm font-semibold text-on-surface-variant mb-1">{t("confirmPassword")}</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      autoComplete="new-password"
                      required={isSignup}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-outline-variant/60"
                    />
                  </div>
                )}

                {successMessage && !isSignup && (
                  <div className="rounded-lg border border-secondary/30 bg-secondary/10 px-4 py-3 text-label-md text-secondary">
                    {successMessage}
                  </div>
                )}

                {errorMessage && (
                  <div className="rounded-lg border border-error/30 bg-error-container/20 px-4 py-3 text-label-md text-error">
                    {errorMessage}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary-container text-white py-3 rounded-lg font-label-md text-label-md hover:shadow-lg hover:shadow-primary-container/20 active:scale-[0.98] transition-all flex items-center justify-center gap-sm group disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span>{isSubmitting ? (isLogin ? t("loggingIn") : t("creatingAccount")) : isLogin ? t("loginSubmit") : t("signupSubmit")}</span>
                    <span className="material-symbols-outlined text-[18px] text-secondary-fixed-dim group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </form>

              {/* Social logins */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-outline-variant/50" />
                </div>
                <div className="relative flex justify-center text-label-sm font-label-sm">
                  <span className="bg-surface px-4 text-on-surface-variant">{t("orContinueWith")}</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                {GOOGLE_CLIENT_ID ? (
                  <div ref={googleButtonRef} className="flex justify-center w-full min-h-[44px]" />
                ) : (
                  <button
                    type="button"
                    onClick={handleDemoGoogle}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-xs py-2.5 px-4 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-all font-label-md text-label-md disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    {t("continueWithGoogle")}
                  </button>
                )}
                {!GOOGLE_CLIENT_ID && !DEMO_MODE && (
                  <p className="text-[11px] text-on-surface-variant/60 text-center">{t("googleNotConfigured")}</p>
                )}
              </div>

              <p className="mt-4 text-center text-[11px] text-on-surface-variant/60 leading-relaxed">
                {t("termsPrefix")}{" "}
                <a className="underline hover:text-secondary" href="#">{t("terms")}</a> {t("and")}{" "}
                <a className="underline hover:text-secondary" href="#">{t("auctionRules")}</a>.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
