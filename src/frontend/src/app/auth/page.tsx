"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login, register } from "@/lib/services/authService";
import { useEffect } from "react";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPass, setShowPass] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === "login";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "signup") {
      setMode("signup");
    }
  }, []);

  function getRedirectPath(roleName?: string) {
    const role = roleName?.toLowerCase();

    if (role?.includes("admin")) {
      return "/admin/revenue";
    }

    if (role?.includes("staff")) {
      return "/staff/approvals";
    }

    return "/dashboard";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    setIsSubmitting(true);

    try {
      if (!isLogin) {
        const response = await register({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          identityNumber: identityNumber.trim(),
          password,
          confirmPassword,
        });

        if (!response.success) {
          throw new Error(response.message || "Registration failed.");
        }

        setSuccessMessage(response.message || "Account created successfully. Please log in.");
        setMode("login");
        setFullName("");
        setPhone("");
        setIdentityNumber("");
        setPassword("");
        setConfirmPassword("");
        return;
      }

      const response = await login({
        usernameOrEmail: email.trim(),
        password,
      });

      if (!response.token) {
        throw new Error("The login response did not include an access token.");
      }

      localStorage.setItem("token", response.token);
      localStorage.setItem("currentUser", JSON.stringify(response));
      router.push(getRedirectPath(response.roleName));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen">
      {/* Left: Hero */}
      <section className="hidden lg:flex lg:w-1/2 relative flex-col justify-end p-xl overflow-hidden">
        <div className="absolute inset-0 bg-primary-container">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0_QH_jlR5knRFMIzliDGgOx7IevRtXO86U-bV1eC5yp0vN_mU8rMMBu6rp0xfOvOMnLLTNAmmeyZ-Hgn2KzXRgr32O4Mk6STYqCaN8-GXPmB2YFM1FqTInWHyrJ3IbzP7bPcNb18zk62zl8Mv-CILX_75WIJQRWBTrpVi2nm84LoTk-1sVdi5O6kudZF1oj9AJ83P3zGe8HD97zTlepjT9XoyscVPA6dprYAId1yy95lPDzU_uee4r7_8tW4Umvw-fL7ZI15STdLl"
            alt="Luxury Watch"
            className="w-full h-full object-cover grayscale opacity-60"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(13,28,50,0.2) 0%, rgba(13,28,50,0.8) 100%)" }} />
        </div>
        <div className="relative z-10 max-w-lg">
          <div className="mb-md">
            <span className="text-secondary font-headline-md text-headline-md font-bold tracking-widest uppercase">LuxeAuction</span>
          </div>
          <h2 className="font-display-lg text-display-lg text-on-primary-fixed mb-sm italic">
            "The pursuit of excellence is a journey without an end."
          </h2>
          <div className="w-16 h-1 bg-secondary mb-lg" />
          <p className="font-body-lg text-on-primary-fixed opacity-70">
            Join the world's most prestigious circle of collectors. Authenticated luxury, global access.
          </p>
        </div>
        <div className="absolute -bottom-24 -right-24 opacity-5">
          <span className="material-symbols-outlined text-[300px]" style={{ fontVariationSettings: "'wght' 100" }}>gavel</span>
        </div>
      </section>

      {/* Right: Auth form */}
      <section className="w-full lg:w-1/2 flex items-start lg:items-center justify-center p-margin-mobile md:p-margin-desktop bg-surface-container-lowest overflow-y-auto">
        <div className="w-full max-w-[480px] min-h-[780px] flex flex-col">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-xl flex-shrink-0">
            <span className="text-primary font-headline-md text-headline-md font-extrabold tracking-tight">LuxeAuction</span>
          </div>

          <div className="bg-surface p-md md:p-lg rounded-xl shadow-sm border border-outline-variant/30 flex-grow flex flex-col">
            {/* Toggle */}
            <div className="flex p-xs bg-surface-container-low rounded-lg mb-md flex-shrink-0">
              {(["login", "signup"] as const).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className={`flex-1 py-3 text-label-md font-label-md rounded-md transition-all ${
                    mode === m
                      ? "bg-surface shadow-sm text-primary"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {m === "login" ? "Log In" : "Create Account"}
                </button>
              ))}
            </div>

            <div className="text-center mb-md flex-shrink-0">
              <h1 className="font-headline-md text-headline-md text-primary mb-xs">
                {isLogin ? "Welcome Back" : "Join the Collection"}
              </h1>
              <p className="font-body-md text-on-surface-variant">
                {isLogin
                  ? "Please enter your credentials to access the lobby."
                  : "Create an account to start bidding on exclusive lots."}
              </p>
            </div>

            {/* Form */}
            <form className="space-y-3 flex-grow" onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="Alexander Sterling"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    autoComplete="name"
                    required={!isLogin}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-outline-variant/60"
                  />
                </div>
              )}

              {!isLogin && (
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+1 212 555 0182"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      autoComplete="tel"
                      required={!isLogin}
                      className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-outline-variant/60"
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-1">Identity Number</label>
                    <input
                      type="text"
                      placeholder="A1234567"
                      value={identityNumber}
                      onChange={(event) => setIdentityNumber(event.target.value)}
                      autoComplete="off"
                      required={!isLogin}
                      className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-outline-variant/60"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="collector@luxe.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-outline-variant/60"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-label-md text-label-md text-on-surface-variant">Password</label>
                  {isLogin && (
                    <a href="#" className="text-label-sm font-label-sm text-secondary hover:underline">Forgot Password?</a>
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
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-outline-variant/60"
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

              {!isLogin && (
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    required={!isLogin}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-outline-variant/60"
                  />
                </div>
              )}

              {successMessage && (
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
                  className="w-full bg-primary-container text-white py-3.5 rounded-lg font-label-md text-label-md hover:shadow-lg hover:shadow-primary-container/20 active:scale-[0.98] transition-all flex items-center justify-center gap-sm group disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span>{isSubmitting ? (isLogin ? "Checking credentials..." : "Creating account...") : isLogin ? "Access Account" : "Create Account"}</span>
                  <span className="material-symbols-outlined text-[18px] text-secondary-fixed-dim group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
            </form>

            {/* Social logins */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-outline-variant/50" />
              </div>
              <div className="relative flex justify-center text-label-sm font-label-sm">
                <span className="bg-surface px-4 text-on-surface-variant">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-sm">
              <button className="flex items-center justify-center gap-xs py-2.5 px-4 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-all font-label-md text-label-md">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button className="flex items-center justify-center gap-xs py-2.5 px-4 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-all font-label-md text-label-md">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.11 2.31-.91 3.73-.8 1.51.13 2.65.69 3.4 1.76-3.13 1.83-2.6 6.04.48 7.33-.62 1.55-1.46 3.09-2.69 4.1zm-4.71-14.24c-.04-1.93 1.6-3.64 3.46-3.71.21 2.2-2.11 3.86-3.46 3.71z" />
                </svg>
                Apple
              </button>
            </div>

            <p className="mt-8 text-center text-label-sm text-on-surface-variant/60 leading-relaxed">
              By accessing LuxeAuction, you agree to our{" "}
              <a className="underline hover:text-secondary" href="#">Terms of Service</a> and{" "}
              <a className="underline hover:text-secondary" href="#">Auction Rules</a>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
