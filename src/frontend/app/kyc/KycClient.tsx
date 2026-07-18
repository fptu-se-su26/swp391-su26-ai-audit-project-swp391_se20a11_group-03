"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError, kycApi, sellerContractApi, updateRoleCookie, userApi } from "@/lib/api";
import LuxuryDatePicker from "@/components/ui/LuxuryDatePicker";

type Picked = { file: File; preview: string } | null;

function ImagePicker({
  title,
  value,
  onPick,
  onClear,
}: {
  title: string;
  value: Picked;
  onPick: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
            value ? "bg-green-500/10 text-green-300" : "bg-white/10 text-white/50"
          }`}
        >
          {value ? "Đã chọn" : "Chưa tải lên"}
        </span>
      </div>

      {!value ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-10 text-center hover:border-[var(--luxora-gold)]"
        >
          <span className="material-symbols-outlined text-3xl text-white/30">
            cloud_upload
          </span>
          <p className="text-sm text-white/50">Bấm để chọn ảnh</p>
        </button>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-white/10 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.preview}
            alt={title}
            className="h-20 w-32 rounded-lg object-cover"
          />
          <button
            type="button"
            onClick={onClear}
            className="text-white/40 hover:text-red-300"
            aria-label="Xoá ảnh"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

const FIELD_CLASS =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]";

// Họ tên trên CCCD in hoa toàn bộ: chỉ chữ hoa (kể cả có dấu) và khoảng trắng.
const NAME_PATTERN = /^[\p{Lu}][\p{Lu}\s]*$/u;
const CCCD_PATTERN = /^0\d{11}$/;

export default function KycClient() {
  const [front, setFront] = useState<Picked>(null);
  const [back, setBack] = useState<Picked>(null);
  const [selfie, setSelfie] = useState<Picked>(null);

  const [fullName, setFullName] = useState("");
  const [cccdNumber, setCccdNumber] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("MALE");
  const [issueDate, setIssueDate] = useState("");
  const [issuePlace, setIssuePlace] = useState("");
  // KYC form: identity-truth commitment (required). Seller registration is a
  // separate step shown only after the KYC is APPROVED.
  const [identityCommit, setIdentityCommit] = useState(false);
  const [roleName, setRoleName] = useState<string | null>(null);
  const [agreeSellerTerms, setAgreeSellerTerms] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [sellerSuccess, setSellerSuccess] = useState<string | null>(null);
  const [sellerError, setSellerError] = useState<string | null>(null);

  const [ocrLoading, setOcrLoading] = useState(false);
  const [contractLoading, setContractLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Current KYC status: gate the form so a user can't re-submit while a
  // submission is PENDING or already APPROVED. Re-submission is only allowed
  // when there is no submission yet, or the last one was REJECTED/INFO_REQUIRED.
  const [statusLoading, setStatusLoading] = useState(true);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  useEffect(() => {
    kycApi
      .mine()
      .then((res) => {
        setExistingStatus(res.data?.status ?? null);
        setRejectionReason(res.data?.rejectionReason ?? null);
      })
      .catch(() => setExistingStatus(null))
      .finally(() => setStatusLoading(false));
    // Role determines whether the seller-registration box shows after approval.
    userApi
      .profile()
      .then((res) => setRoleName(res.data.roleName))
      .catch(() => setRoleName(null));
  }, [success, sellerSuccess]);

  async function handleBecomeSeller() {
    setSellerError(null);
    if (!agreeSellerTerms) {
      setSellerError("Bạn cần đọc và đồng ý hợp đồng người bán trước khi đăng ký.");
      return;
    }
    setRegistering(true);
    try {
      const res = await sellerContractApi.submit();
      updateRoleCookie(res.data?.roleName ?? "Seller");
      setSellerSuccess(
        "Đăng ký Seller thành công! Hợp đồng đã được ký điện tử. Bạn có thể đăng vật phẩm ngay.",
      );
    } catch (err) {
      setSellerError(
        err instanceof ApiError ? err.message : "Không thể đăng ký Seller. Vui lòng thử lại.",
      );
    } finally {
      setRegistering(false);
    }
  }

  function pick(setter: (v: Picked) => void, current: Picked) {
    return (file: File) => {
      if (current) URL.revokeObjectURL(current.preview);
      setter({ file, preview: URL.createObjectURL(file) });
    };
  }
  function clear(setter: (v: Picked) => void, current: Picked) {
    return () => {
      if (current) URL.revokeObjectURL(current.preview);
      setter(null);
    };
  }

  const uploaded = [front, back, selfie].filter(Boolean).length;

  async function handleViewContract() {
    setError(null);
    setContractLoading(true);
    try {
      const blob = await sellerContractApi.previewPdf();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      setError("Không thể mở hợp đồng. Vui lòng thử lại.");
    } finally {
      setContractLoading(false);
    }
  }

  async function handleOcr() {
    setError(null);
    setInfo(null);
    if (!front || !back) {
      setError("Cần chọn ảnh CCCD mặt trước và mặt sau trước khi quét.");
      return;
    }
    setOcrLoading(true);
    try {
      const res = await kycApi.ocr(front.file, back.file);
      const d = res.data;
      if (d?.fullName) setFullName(d.fullName.toLocaleUpperCase("vi-VN"));
      if (d?.cccdNumber) setCccdNumber(d.cccdNumber);
      if (d?.dob) setDob(d.dob);
      if (d?.gender) setGender(d.gender);
      if (d?.issueDate) setIssueDate(d.issueDate);
      if (d?.issuePlace) setIssuePlace(d.issuePlace);
      setInfo(d?.message ?? "Đã trích xuất thông tin. Vui lòng kiểm tra lại.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể quét CCCD.");
    } finally {
      setOcrLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSuccess(null);

    if (!front || !back || !selfie)
      return setError("Vui lòng tải đủ 3 ảnh: CCCD mặt trước, mặt sau và ảnh chân dung.");
    if (!fullName.trim()) return setError("Vui lòng nhập họ và tên như trên CCCD.");
    if (!cccdNumber.trim()) return setError("Vui lòng nhập số CCCD.");
    if (!dob) return setError("Vui lòng chọn ngày sinh.");
    if (!issueDate) return setError("Vui lòng chọn ngày cấp CCCD.");
    if (!issuePlace.trim()) return setError("Vui lòng nhập nơi cấp CCCD.");
    if (!NAME_PATTERN.test(fullName.trim()))
      return setError("Họ và tên phải viết HOA toàn bộ như trên CCCD (chỉ gồm chữ cái và khoảng trắng).");
    if (!CCCD_PATTERN.test(cccdNumber.trim()))
      return setError("Số CCCD không hợp lệ (12 chữ số, bắt đầu bằng 0).");
    const today = new Date().toISOString().slice(0, 10);
    if (dob >= today) return setError("Ngày sinh không hợp lệ.");
    if (issueDate > today) return setError("Ngày cấp không thể ở tương lai.");
    if (issueDate <= dob) return setError("Ngày cấp phải sau ngày sinh.");
    if (!identityCommit)
      return setError("Bạn cần cam kết thông tin cung cấp là chính xác trước khi gửi.");

    setSubmitting(true);
    try {
      await kycApi.submit({
        fullName: fullName.trim(),
        cccdNumber: cccdNumber.trim(),
        dob,
        gender,
        issueDate,
        issuePlace: issuePlace.trim(),
        frontImage: front.file,
        backImage: back.file,
        selfieImage: selfie.file,
        signSellerAgreement: false,
      });
      setSuccess("Đã gửi hồ sơ KYC. Nhân viên sẽ duyệt trong thời gian sớm nhất.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể gửi hồ sơ KYC.");
    } finally {
      setSubmitting(false);
    }
  }

  if (statusLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-sm text-white/50">
        Đang tải trạng thái KYC...
      </div>
    );
  }

  if (existingStatus === "APPROVED") {
    const isSeller = (roleName ?? "").toLowerCase() === "seller";
    const isBasicUser = (roleName ?? "").toLowerCase() === "user";
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display-lg text-3xl">Xác minh danh tính</h1>
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 p-10 text-center">
          <span className="material-symbols-outlined text-5xl text-green-300">verified</span>
          <p className="text-lg font-semibold text-green-300">Đã được xác thực KYC</p>
          <p className="text-sm text-white/50">
            Danh tính của bạn đã được xác minh. Bạn có thể sử dụng đầy đủ các tính năng.
          </p>
        </div>

        {/* Seller registration — unlocked only after KYC approval. */}
        {isSeller || sellerSuccess ? (
          <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-[var(--luxora-gold)]/30 bg-[var(--luxora-gold)]/5 p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-[var(--luxora-gold-light)]">
              storefront
            </span>
            <p className="text-base font-semibold text-[var(--luxora-gold-light)]">
              {sellerSuccess ?? "Bạn đã là Seller"}
            </p>
            <p className="text-sm text-white/50">
              Hợp đồng người bán đã được ký điện tử. Vào &quot;Đăng vật phẩm&quot; để bắt đầu bán.
            </p>
          </div>
        ) : isBasicUser ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-[var(--luxora-gold-light)]">
                storefront
              </span>
              <h2 className="text-base font-semibold">Đăng ký làm Seller</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/55">
              Danh tính của bạn đã được xác thực — bạn đủ điều kiện đăng ký bán hàng.
              Chỉ cần đọc và ký hợp đồng người bán, tài khoản sẽ được nâng cấp{" "}
              <b>ngay lập tức</b>, không cần chờ duyệt.
            </p>

            <button
              type="button"
              onClick={handleViewContract}
              disabled={contractLoading}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--luxora-gold-light)] hover:underline disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">picture_as_pdf</span>
              {contractLoading ? "Đang mở hợp đồng..." : "Đọc hợp đồng người bán (PDF)"}
            </button>

            <label className="mt-3 flex items-start gap-2 text-xs text-white/60">
              <input
                type="checkbox"
                checked={agreeSellerTerms}
                onChange={(e) => setAgreeSellerTerms(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                Tôi đã đọc và đồng ý với hợp đồng người bán, trong đó cam đoan{" "}
                <b>chỉ bán hàng thật, không đăng bán hàng giả/hàng nhái</b> và chịu hoàn
                toàn trách nhiệm trước pháp luật nếu vi phạm.
              </span>
            </label>

            {sellerError && (
              <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {sellerError}
              </div>
            )}

            <button
              type="button"
              disabled={registering || !agreeSellerTerms}
              onClick={() => void handleBecomeSeller()}
              className="gradient-cta mt-5 w-full rounded-full py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              {registering ? "Đang ký hợp đồng..." : "Ký hợp đồng & trở thành Seller"}
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  if (existingStatus === "PENDING") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display-lg text-3xl">Xác minh danh tính</h1>
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-10 text-center">
          <span className="material-symbols-outlined text-5xl text-yellow-300">hourglass_top</span>
          <p className="text-lg font-semibold text-yellow-300">Hồ sơ đang chờ duyệt</p>
          <p className="text-sm text-white/50">
            Bạn đã gửi hồ sơ KYC. Không thể chỉnh sửa hay gửi lại ảnh cho đến khi nhân viên
            xử lý. Nếu hồ sơ bị từ chối, bạn sẽ có thể gửi lại.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display-lg text-3xl">Xác minh danh tính</h1>
      {(existingStatus === "REJECTED" || existingStatus === "INFO_REQUIRED") && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {existingStatus === "REJECTED" ? "Hồ sơ trước đã bị từ chối." : "Nhân viên yêu cầu bổ sung."}
          {rejectionReason ? ` Lý do: ${rejectionReason}` : ""} Vui lòng gửi lại.
        </div>
      )}
      <p className="mt-2 text-sm text-white/50">
        Tải ảnh CCCD (mặt trước, mặt sau) và ảnh chân dung, sau đó điền thông tin.
        Bạn có thể bấm &quot;Quét CCCD tự động&quot; để AI điền giúp.
      </p>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs text-white/50">
          <span>Ảnh đã chọn</span>
          <span>{uploaded}/3</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-[var(--luxora-gold)] transition-all"
            style={{ width: `${(uploaded / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-5">
        <ImagePicker
          title="CCCD mặt trước"
          value={front}
          onPick={pick(setFront, front)}
          onClear={clear(setFront, front)}
        />
        <ImagePicker
          title="CCCD mặt sau"
          value={back}
          onPick={pick(setBack, back)}
          onClear={clear(setBack, back)}
        />
        <ImagePicker
          title="Ảnh chân dung (selfie)"
          value={selfie}
          onPick={pick(setSelfie, selfie)}
          onClear={clear(setSelfie, selfie)}
        />
      </div>

      <button
        type="button"
        onClick={handleOcr}
        disabled={ocrLoading || !front || !back}
        className="mt-5 w-full rounded-full border border-[var(--luxora-gold)]/40 py-3 text-sm font-semibold text-[var(--luxora-gold-light)] hover:bg-[var(--luxora-gold)]/10 disabled:opacity-40"
      >
        {ocrLoading ? "Đang quét..." : "Quét CCCD tự động (AI)"}
      </button>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-white/50">Họ và tên</label>
          <input
            className={FIELD_CLASS}
            value={fullName}
            onChange={(e) => setFullName(e.target.value.toLocaleUpperCase("vi-VN"))}
            placeholder="Nhập họ và tên trên CCCD"
          />
          <p className="mt-1 text-[11px] text-white/35">Viết HOA toàn bộ như trên CCCD (tự động chuyển).</p>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">Số CCCD</label>
          <input
            className={FIELD_CLASS}
            value={cccdNumber}
            onChange={(e) => setCccdNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
            placeholder="0xxxxxxxxxxx"
            inputMode="numeric"
            maxLength={12}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">Ngày sinh</label>
          <LuxuryDatePicker
            ariaLabel="Ngày sinh"
            value={dob}
            onChange={setDob}
            max={new Date().toISOString().slice(0, 10)}
            placeholder="Chọn ngày sinh"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">Giới tính</label>
          <select className={FIELD_CLASS} value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="MALE" className="bg-[var(--luxora-bg-elevated)]">Nam</option>
            <option value="FEMALE" className="bg-[var(--luxora-bg-elevated)]">Nữ</option>
            <option value="OTHER" className="bg-[var(--luxora-bg-elevated)]">Khác</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">Ngày cấp</label>
          <LuxuryDatePicker
            ariaLabel="Ngày cấp"
            value={issueDate}
            onChange={setIssueDate}
            max={new Date().toISOString().slice(0, 10)}
            placeholder="Chọn ngày cấp"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">Nơi cấp</label>
          <input className={FIELD_CLASS} value={issuePlace} onChange={(e) => setIssuePlace(e.target.value)} placeholder="Cục Cảnh sát QLHC về TTXH" />
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <label className="flex items-start gap-2 text-xs text-white/60">
          <input
            type="checkbox"
            checked={identityCommit}
            onChange={(e) => setIdentityCommit(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            Tôi cam kết toàn bộ thông tin và giấy tờ cung cấp là <b>chính xác, thật 100%</b> và
            thuộc về chính tôi. Tôi hiểu rằng cung cấp giấy tờ giả mạo có thể bị khóa tài
            khoản và xử lý theo quy định pháp luật.
          </span>
        </label>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {info && (
        <div className="mt-5 rounded-xl border border-[var(--luxora-gold)]/30 bg-[var(--luxora-gold)]/5 px-4 py-3 text-sm text-[var(--luxora-gold-light)]">
          {info}
        </div>
      )}
      {success && (
        <div className="mt-5 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || uploaded < 3}
        className="gradient-cta mt-8 w-full rounded-full py-3.5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "Đang gửi..." : "Gửi để xác minh"}
      </button>
    </form>
  );
}
