"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ApiError,
  sellerContractApi,
  updateRoleCookie,
  userApi,
  type UserProfile,
} from "@/lib/api";

export default function BecomeSellerClient() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [signed, setSigned] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const sellerRoleActive = profile?.roleName?.toLowerCase() === "seller";

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    Promise.all([userApi.profile(), sellerContractApi.mine()])
      .then(async ([profileResponse, contractResponse]) => {
        if (!active) return;
        const hasSignedContract = Boolean(contractResponse.data?.signed);
        setProfile(profileResponse.data);
        setSigned(hasSignedContract);
        setAgreed(hasSignedContract);
        const blob = hasSignedContract
          ? await sellerContractApi.signedPdf()
          : await sellerContractApi.previewPdf();
        objectUrl = URL.createObjectURL(blob);
        if (active) setPdfUrl(objectUrl);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Không thể tải hợp đồng.");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  async function submitAgreement() {
    if (!agreed) {
      setError("Vui lòng xác nhận bạn đã đọc và đồng ý với hợp đồng.");
      return;
    }
    if (!profile?.identityVerified) {
      setError("Bạn cần hoàn tất KYC trước khi gửi hợp đồng đăng ký Seller.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await sellerContractApi.submit();
      updateRoleCookie(response.data.roleName ?? "Seller");
      setProfile((current) => current ? { ...current, roleName: response.data.roleName ?? "Seller" } : current);
      setSigned(true);
    } catch (reason: unknown) {
      setError(reason instanceof ApiError ? reason.message : "Không thể gửi hợp đồng. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="mx-auto max-w-5xl px-6 py-16 text-white/60">Đang tải hợp đồng...</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-7 lg:py-14">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d7ad4e]">Đăng ký bán hàng</p>
      <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Trở thành người bán</h1>
      <p className="mt-3 max-w-3xl text-white/55">Đọc, kiểm tra và gửi hợp đồng điện tử để kích hoạt quyền đăng bán trên BidZone.</p>

      <div className="mt-8 rounded-3xl border border-[#d5aa45]/25 bg-gradient-to-b from-[#17140f]/95 to-[#080706]/95 p-4 shadow-[0_30px_90px_rgba(0,0,0,.45)] sm:p-7">
        <ol className="grid gap-3 sm:grid-cols-3">
          {["Đọc điều khoản", "Xem trước PDF", "Gửi hợp đồng"].map((label, index) => (
            <li key={label} className="rounded-xl border border-[#d5aa45]/45 bg-[#d5aa45]/10 px-4 py-3">
              <span className="font-mono text-xs font-bold text-[#d7ad4e]">0{index + 1}</span>
              <p className="mt-1 text-sm font-semibold text-[#f8f2e7]">{label}</p>
            </li>
          ))}
        </ol>

        <section className="mt-6 rounded-2xl border border-[#d5aa45]/30 bg-black/35 p-4 sm:p-6">
          <h2 className="text-xl font-bold text-[#f8f2e7]">Hợp đồng nền tảng dành cho người bán</h2>
          <p className="mt-2 text-sm text-white/50">Hợp đồng có hiệu lực sau khi tài khoản hoàn tất KYC và gửi đăng ký Seller.</p>

          <div className="mt-5 max-h-44 overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-4 text-sm leading-6 text-white/65 [scrollbar-color:#b9974f_#17130d]">
            <p className="font-bold text-[#e2c171]">ĐIỀU KHOẢN HỢP ĐỒNG NGƯỜI BÁN</p>
            <p className="mt-2">1. Người bán đồng ý niêm yết và bán sản phẩm qua nền tảng đấu giá.</p>
            <p>2. Phí dịch vụ được áp dụng theo chính sách tài khoản và giao dịch hiện hành.</p>
            <p>3. Người bán tự kê khai và nộp thuế theo quy định pháp luật.</p>
            <p>4. Thông tin KYC và quyền sở hữu sản phẩm phải chính xác, hợp pháp.</p>
            <p>5. Hợp đồng có hiệu lực sau khi được gửi thành công.</p>
          </div>

          <p className="mb-2 mt-5 text-sm font-semibold text-[#d9c79d]">{signed ? "Hợp đồng đã ký (PDF)" : "Xem trước hợp đồng (PDF)"}</p>
          {pdfUrl ? (
            <iframe title="Hợp đồng người bán" src={pdfUrl} className="h-[360px] w-full rounded-xl border border-[#d5aa45]/25 bg-white sm:h-[400px]" />
          ) : <p className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">Không thể tải PDF hợp đồng.</p>}

          {error && <p className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

          {sellerRoleActive ? (
            <div className="mt-5 rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-4 text-emerald-200">Hợp đồng đã được gửi. Tài khoản Seller đang hoạt động.</div>
          ) : (
            <div className="mt-5 rounded-xl border border-[#d5aa45]/25 bg-[#d5aa45]/[0.07] p-4">
              <label className="flex items-start gap-3 text-sm text-white/70">
                <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-1 accent-[#d5aa45]" />
                Tôi đã đọc, hiểu và đồng ý với các điều khoản của hợp đồng người bán.
              </label>
              <button type="button" onClick={submitAgreement} disabled={submitting || !agreed || !profile?.identityVerified} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c89418] to-[#f0d787] px-6 py-3.5 font-bold text-[#171008] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto">
                <span className="material-symbols-outlined text-[19px]">send</span>
                {submitting ? "Đang gửi..." : "Gửi hợp đồng đăng ký Seller"}
              </button>
              {!profile?.identityVerified && <p className="mt-3 text-sm text-amber-200/80">Bạn cần hoàn tất KYC trước khi gửi. <Link href="/kyc" className="font-bold underline">Đi tới KYC</Link></p>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
