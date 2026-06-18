import { apiClient } from "@/lib/apiClient";

export type KycStatus = "PENDING" | "APPROVED" | "REJECTED" | "INFO_REQUIRED";

export type KycForensicsSeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH";

export type KycForensicsSignal = {
  severity: KycForensicsSeverity;
  message: string;
};

export type KycImageAnalysis = {
  riskScore: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
  signals: KycForensicsSignal[];
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

  return apiClient<ApiEnvelope<KycSubmission>>("/kyc", {
    method: "POST",
    body: form,
  });
}

export async function getMyKyc() {
  const raw = await apiClient<ApiEnvelope<KycSubmission | null>>("/kyc/me");
  return unwrap(raw);
}

export async function listKycSubmissions(status?: KycStatus) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiClient<KycSubmission[]>(`/kyc/list${query}`);
}

export async function approveKyc(kycId: number) {
  return apiClient<ApiEnvelope<KycSubmission>>(`/kyc/${kycId}/approve`, {
    method: "POST",
  });
}

export async function rejectKyc(kycId: number, reason: string) {
  return apiClient<ApiEnvelope<KycSubmission>>(
    `/kyc/${kycId}/reject?reason=${encodeURIComponent(reason)}`,
    { method: "POST" }
  );
}

export async function requestKycInfo(kycId: number, reason?: string) {
  const query = reason ? `?reason=${encodeURIComponent(reason)}` : "";
  return apiClient<ApiEnvelope<KycSubmission>>(`/kyc/${kycId}/request-info${query}`, {
    method: "POST",
  });
}
