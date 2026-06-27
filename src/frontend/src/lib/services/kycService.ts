import { apiClient, getStoredToken, resolveApiUrl } from "@/lib/apiClient";
import { DEMO_KYC_KEY, DEMO_MODE, readDemoUser } from "@/lib/demoMode";

export type KycStatus = "PENDING" | "APPROVED" | "REJECTED" | "INFO_REQUIRED";
export type KycForensicsSeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH";
export type KycForensicsSignal = { severity: KycForensicsSeverity; message: string };
export type KycImageAnalysis = {
  riskScore: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
  signals: KycForensicsSignal[];
};

export type CccdDuplicateInfo = {
  userId: number;
  email: string;
  fullName: string;
  kycStatus: string;
  identityVerified?: boolean;
};

export type CccdOcrResult = {
  success: boolean;
  message: string;
  provider?: string;
  confidenceScore?: number;
  fullName?: string;
  cccdNumber?: string;
  dob?: string;
  gender?: string;
  issueDate?: string;
  issuePlace?: string;
  address?: string;
  cccdDuplicate?: boolean;
  cccdDuplicates?: CccdDuplicateInfo[];
};

export type KycSubmission = {
  kycId: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  cccdNumber: string;
  dob: string;
  gender: string;
  issueDate: string;
  issuePlace: string;
  frontImageUrl: string;
  backImageUrl: string;
  selfieImageUrl: string;
  status: KycStatus;
  submittedAt: string | null;
  processedAt: string | null;
  processedByName: string | null;
  rejectionReason: string | null;
  frontImageAnalysis?: KycImageAnalysis | null;
  backImageAnalysis?: KycImageAnalysis | null;
  selfieImageAnalysis?: KycImageAnalysis | null;
  cccdDuplicate?: boolean;
  cccdDuplicates?: CccdDuplicateInfo[];
};

type ApiEnvelope<T> = { success: boolean; data?: T; message?: string };

function unwrap<T>(payload: ApiEnvelope<T> | T | null): T | null {
  if (payload == null) return null;
  if (typeof payload === "object" && "success" in (payload as Record<string, unknown>)) {
    return ((payload as ApiEnvelope<T>).data ?? null) as T | null;
  }
  return payload as T;
}

export type SubmitKycPayload = {
  fullName: string;
  phone: string;
  cccdNumber: string;
  dob: string;
  gender: string;
  issueDate: string;
  issuePlace: string;
  frontImage: File;
  backImage: File;
  selfieImage: File;
};

export async function submitKyc(payload: SubmitKycPayload) {
  if (DEMO_MODE) {
    const user = readDemoUser();
    const submission: KycSubmission = {
      kycId: Date.now(), userId: user?.userId ?? 9001, fullName: payload.fullName,
      email: user?.email ?? "demo@luxeauction.vn", phone: payload.phone,
      cccdNumber: payload.cccdNumber, dob: payload.dob, gender: payload.gender,
      issueDate: payload.issueDate, issuePlace: payload.issuePlace,
      frontImageUrl: "/product-placeholder.svg", backImageUrl: "/product-placeholder.svg",
      selfieImageUrl: "/product-placeholder.svg", status: "PENDING",
      submittedAt: new Date().toISOString(), processedAt: null, processedByName: null,
      rejectionReason: null,
    };
    const submissions = readDemoSubmissions().filter((item) => item.userId !== submission.userId);
    localStorage.setItem(DEMO_KYC_KEY, JSON.stringify([...submissions, submission]));
    await new Promise((resolve) => setTimeout(resolve, 700));
    return { success: true, data: submission, message: "Hồ sơ demo đã được gửi thành công." };
  }
  const form = new FormData();
  form.append("fullName", payload.fullName);
  form.append("phone", payload.phone);
  form.append("cccdNumber", payload.cccdNumber);
  form.append("dob", payload.dob);
  form.append("gender", payload.gender);
  form.append("issueDate", payload.issueDate);
  form.append("issuePlace", payload.issuePlace);
  form.append("frontImage", payload.frontImage);
  form.append("backImage", payload.backImage);
  form.append("selfieImage", payload.selfieImage);
  return apiClient<ApiEnvelope<KycSubmission>>("/kyc", { method: "POST", body: form });
}

export async function scanCccdOcr(frontImage: File, backImage: File): Promise<CccdOcrResult> {
  const form = new FormData();
  form.append("frontImage", frontImage);
  form.append("backImage", backImage);
  const raw = await apiClient<ApiEnvelope<CccdOcrResult>>("/kyc/ocr", { method: "POST", body: form });
  return unwrap(raw) ?? { success: false, message: "Không nhận được kết quả OCR" };
}

export async function getMyKyc() {
  if (DEMO_MODE) {
    const user = readDemoUser();
    if (!user?.userId) return null;
    return readDemoSubmissions()
      .filter((item) => item.userId === user.userId)
      .sort((a, b) => Date.parse(b.submittedAt ?? "") - Date.parse(a.submittedAt ?? ""))[0] ?? null;
  }
  const raw = await apiClient<ApiEnvelope<KycSubmission | null>>("/kyc/me");
  return unwrap(raw);
}

export async function listKycSubmissions(status?: KycStatus) {
  if (DEMO_MODE) return readDemoSubmissions().filter((item) => !status || item.status === status);
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiClient<KycSubmission[]>(`/kyc/list${query}`);
}

export async function approveKyc(kycId: number) {
  if (DEMO_MODE) return updateDemoKyc(kycId, "APPROVED");
  return apiClient<ApiEnvelope<KycSubmission>>(`/kyc/${kycId}/approve`, { method: "POST" });
}

export async function rejectKyc(kycId: number, reason: string) {
  if (DEMO_MODE) return updateDemoKyc(kycId, "REJECTED", reason);
  return apiClient<ApiEnvelope<KycSubmission>>(`/kyc/${kycId}/reject?reason=${encodeURIComponent(reason)}`, {
    method: "POST",
  });
}

export async function requestKycInfo(kycId: number, reason?: string) {
  if (DEMO_MODE) return updateDemoKyc(kycId, "INFO_REQUIRED", reason);
  const query = reason ? `?reason=${encodeURIComponent(reason)}` : "";
  return apiClient<ApiEnvelope<KycSubmission>>(`/kyc/${kycId}/request-info${query}`, { method: "POST" });
}

export async function fetchKycDocument(path: string): Promise<Blob> {
  const token = getStoredToken();
  const response = await fetch(resolveApiUrl(path), {
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) throw new Error("Unable to load the protected KYC document");
  return response.blob();
}

function updateDemoKyc(kycId: number, status: KycStatus, reason?: string) {
  const submissions = readDemoSubmissions();
  const current = submissions.find((item) => item.kycId === kycId);
  if (!current) throw new Error("Demo KYC not found");
  if (current.status !== "PENDING") throw new Error("Demo KYC was already processed");
  const updated: KycSubmission = {
    ...current,
    status,
    rejectionReason: reason ?? null,
    processedAt: new Date().toISOString(),
    processedByName: "Demo Staff",
  };
  localStorage.setItem(DEMO_KYC_KEY, JSON.stringify(
    submissions.map((item) => item.kycId === kycId ? updated : item)
  ));
  return Promise.resolve({ success: true, data: updated, message: `Demo KYC ${status.toLowerCase()}` });
}

function readDemoSubmissions(): KycSubmission[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(DEMO_KYC_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
