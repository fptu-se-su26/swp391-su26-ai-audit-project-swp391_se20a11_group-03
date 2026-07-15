"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError, kycApi, sellerContractApi } from "@/lib/api";

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

export default function KycClient() {
  const [front, setFront] = useState<Picked>(null);
  const [back, setBack] = useState<Picked>(null);
  const [selfie, setSelfie] = useState<Picked>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [cccdNumber, setCccdNumber] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("MALE");
  const [issueDate, setIssueDate] = useState("");
  const [issuePlace, setIssuePlace] = useState("");
  const [signSellerAgreement, setSignSellerAgreement] = useState(false);

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
  }, [success]);

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
      if (d?.fullName) setFullName(d.fullName);
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
    if (!fullName.trim() || !phone.trim() || !cccdNumber.trim() || !dob || !issueDate || !issuePlace.trim())
      return setError("Vui lòng điền đầy đủ các trường thông tin.");

    setSubmitting(true);
    try {
      await kycApi.submit({
        fullName: fullName.trim(),
        phone: phone.trim(),
        cccdNumber: cccdNumber.trim(),
        dob,
        gender,
        issueDate,
        issuePlace: issuePlace.trim(),
        frontImage: front.file,
        backImage: back.file,
        selfieImage: selfie.file,
        signSellerAgreement,
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
          <input className={FIELD_CLASS} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="NGUYEN VAN A" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">Số điện thoại</label>
          <input className={FIELD_CLASS} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xxxxxxxx" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">Số CCCD</label>
          <input className={FIELD_CLASS} value={cccdNumber} onChange={(e) => setCccdNumber(e.target.value)} placeholder="0xxxxxxxxxxx" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">Ngày sinh</label>
          <input type="date" className={FIELD_CLASS} value={dob} onChange={(e) => setDob(e.target.value)} />
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
          <input type="date" className={FIELD_CLASS} value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">Nơi cấp</label>
          <input className={FIELD_CLASS} value={issuePlace} onChange={(e) => setIssuePlace(e.target.value)} placeholder="Cục Cảnh sát QLHC về TTXH" />
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <button
          type="button"
          onClick={handleViewContract}
          disabled={contractLoading}
          className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--luxora-gold-light)] hover:underline disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-base">picture_as_pdf</span>
          {contractLoading ? "Đang mở hợp đồng..." : "Xem hợp đồng người bán (PDF)"}
        </button>
        <label className="flex items-start gap-2 text-xs text-white/60">
          <input
            type="checkbox"
            checked={signSellerAgreement}
            onChange={(e) => setSignSellerAgreement(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            Tôi đã đọc và đồng ý với hợp đồng nền tảng dành cho người bán, trong đó cam
            đoan <b>không đăng bán hàng giả/hàng nhái</b> và chịu hoàn toàn trách nhiệm
            trước pháp luật nếu vi phạm (bắt buộc nếu bạn muốn đăng bán vật phẩm).
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
