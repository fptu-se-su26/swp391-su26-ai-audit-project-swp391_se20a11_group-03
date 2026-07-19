import type { LiveAuctionItem } from "@/lib/home-data";
import type { TrustStat } from "@/lib/home-data";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8096/api";

// ---------------------------------------------------------------------------
// Core fetch helper — tự gắn JWT (lưu ở localStorage sau khi login)
// ---------------------------------------------------------------------------
const TOKEN_KEY = "bidzone_token";
const AUTH_ROLE_COOKIE = "bidzone_role";
export const AUTH_STATE_EVENT = "bidzone-auth-change";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_STATE_EVENT));
}

function setAuthRoleCookie(role: ReturnType<typeof toFrontendRole> | null) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = role
    ? `${AUTH_ROLE_COOKIE}=${role}; path=/; max-age=604800; SameSite=Lax${secure}`
    : `${AUTH_ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax${secure}`;
}

function storeLoginResponse(response: LoginResponse) {
  if (!response.token) return;
  setAuthRoleCookie(toFrontendRole(response.roleName));
  setToken(response.token);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const token = auth ? getToken() : null;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(rest.body && !(rest.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.message ?? body.detail ?? body.error ?? message;
    } catch {
      /* body không phải JSON */
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/**
 * POST multipart/form-data (file uploads). Unlike {@link apiFetch} we must NOT
 * set Content-Type — the browser adds the multipart boundary itself.
 */
async function postMultipart<T>(path: string, form: FormData): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.message ?? body.detail ?? body.error ?? message;
    } catch {
      /* body không phải JSON */
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/**
 * Upload one or more images to Cloudinary (via backend /api/uploads) and return
 * the delivered secure URLs.
 */
export async function uploadImages(files: File[]): Promise<string[]> {
  const form = new FormData();
  for (const file of files) form.append("files", file);
  const body = await postMultipart<ApiEnvelope<string[]>>("/uploads", form);
  return body.data ?? [];
}

// ---------------------------------------------------------------------------
// Types (khớp DTO backend)
// ---------------------------------------------------------------------------
export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ProductSummary = {
  productId: number;
  productName: string;
  categoryId: number | null;
  categoryName: string | null;
  startingPrice: number;
  currentBid: number | null;
  status: string;
  imageUrl: string | null;
  auctionId: number | null;
  totalBids: number;
  auctionStatus: string | null;
  auctionStartTime: string | null;
  auctionEndTime: string | null;
  auctionMode: string | null;
};

export type Category = {
  categoryId: number;
  categoryName: string;
  description: string | null;
  isActive: boolean;
};

export type CategoryAttribute = {
  attributeId: number;
  categoryId: number;
  attributeName: string;
  dataType: string;
  isRequired: boolean;
  displayOrder: number;
};

export type LoginResponse = {
  token: string;
  userId: number;
  username: string | null;
  email: string;
  roleName: string | null;
  status: string | null;
  identityVerified: boolean;
  phoneVerified: boolean;
  profileStatus: string | null;
  newUser: boolean;
};

export type AuctionState = {
  auctionId: number;
  productId: number;
  auctionMode: "LIVE" | "TIMED";
  status: string;
  paymentStatus: string | null;
  startingPrice: number;
  bidStep: number;
  minNextBid: number;
  currentHighestBid: number;
  currentWinnerUserId: number | null;
  winnerUsername: string | null;
  startTime: string;
  endTime: string;
  paymentDeadline: string | null;
  totalBids: number;
  serverNow: string;
  priceHidden: boolean | null;
  bidsAnonymous: boolean | null;
};

export type BidRecord = {
  bidId: number;
  auctionId: number;
  userId: number;
  username: string | null;
  bidAmount: number;
  bidTime: string;
};

export type ProductDetail = {
  productId: number;
  productName: string;
  description: string | null;
  categoryId: number | null;
  categoryName: string | null;
  sellerId: number;
  startingPrice: number;
  stepPrice: number;
  currentBid: number;
  status: string;
  imageUrl: string | null;
  imageUrls: string[];
  auctionId: number | null;
  auctionStatus: string | null;
  auctionEndTime: string | null;
};

export type BidResult = {
  success: boolean;
  message: string | null;
  auctionId: number;
  bidAmount: number | null;
  [key: string]: unknown;
};

export type AuctionEligibility = {
  auctionId: number;
  productId: number;
  depositAllowed: boolean;
  alreadyDeposited: boolean;
  depositAmount: number | null;
  depositDeadline: string | null;
  message: string | null;
  kycVerified: boolean;
  profileStatus: string | null;
};

export type AuctionDepositResult = {
  depositId: number;
  auctionId: number;
  userId: number;
  depositAmount: number;
  walletBalance: number;
  walletHoldBalance: number;
  status: string;
  message: string;
};

export type UserProfile = {
  userId: number;
  fullName: string;
  email: string;
  emailVerified: boolean;
  phone: string | null;
  phoneVerified: boolean;
  phoneVerifiedAt: string | null;
  identityNumber: string | null;
  roleName: string;
  status: string;
  identityVerified: boolean;
  profileStatus: string | null;
  identityVerifiedAt: string | null;
  active: boolean;
  paymentStrikeCount: number;
  lockedByPaymentStrikes: boolean;
};

export type WalletInfo = {
  walletId: number;
  userId: number;
  balance: number;
  holdBalance: number;
  availableBalance: number;
  status: string;
};

export type WalletTransaction = {
  transactionId: number;
  walletId: number;
  userId: number;
  userName: string;
  transactionType: string;
  transactionTypeLabel: string;
  amount: number;
  signedAmount: number;
  direction: string;
  status: string;
  referenceCode: string | null;
  description: string | null;
  createdAt: string;
};

export type DepositQrResponse = {
  amount: number;
  bankId: string;
  bankAccount: string;
  accountName: string;
  content: string;
  qrUrl: string;
};

export type UserBid = {
  bidId: number;
  auctionId: number;
  productId: number;
  productName: string;
  lotNumber: string;
  image: string | null;
  currentBid: number;
  userHighestBid: number | null;
  startingPrice: number;
  timeLeft: string;
  status: string;
  paymentStatus: string | null;
  auctionEndTime: string | null;
};

export type WonAuction = {
  id: number;
  auctionId: number;
  productId: number;
  productName: string;
  lotNumber: string;
  image: string | null;
  finalPrice: number;
  wonDate: string;
  paymentStatus: string | null;
  paymentDeadline: string | null;
  status: "paid" | "pending_payment" | "forfeited";
};

export type PurchaseContractPreview = {
  auctionId: number;
  productId: number | null;
  productName: string;
  finalPrice: number;
  depositAmount: number;
  remainingAmount: number;
  sellerName: string;
  sellerEmail: string | null;
  buyerName: string;
  buyerEmail: string | null;
  adminName: string;
  adminEmail: string | null;
  signed: boolean;
  acknowledged: boolean;
  contractId: number | null;
  fileUrl: string | null;
  signedAt: string | null;
};

export type WatchlistEntry = {
  id: number;
  productId: number;
  auctionId: number | null;
  productName: string;
  lotNumber: string;
  image: string | null;
  currentBid: number;
  endTime: string | null;
  status: string;
};

export type Withdrawal = {
  id: number;
  userId: number;
  userName: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: string;
  staffNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SellerProduct = ProductSummary & {
  scheduledDurationSeconds: number | null;
  rejectionReason: string | null;
};

export type SellerProductImage = {
  imageId: number;
  imageUrl: string;
  isPrimary: boolean;
};

export type SellerEditableProduct = {
  productId: number;
  categoryId: number | null;
  categoryName: string | null;
  productName: string;
  description: string | null;
  startingPrice: number;
  status: string;
  rejectionReason: string | null;
  images: SellerProductImage[];
};

export type Conversation = {
  conversationId: number;
  userId: number;
  userName: string;
  assignedStaffId: number | null;
  assignedStaffName: string | null;
  sellerId: number | null;
  sellerName: string | null;
  productId: number | null;
  type: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastMessage: string | null;
  unreadCount: number;
};

export type ConversationMessage = {
  messageId: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  content: string;
  isRead: boolean;
  sentAt: string;
};

export type AdminDashboardSummary = {
  totalUsers: number;
  totalProducts: number;
  totalAuctions: number;
  activeAuctions: number;
  totalRevenue: number;
  totalTopUps: number;
  depositsHeld: number;
  pendingWithdrawals: number;
  adminBalance: number;
};

export type DailyRevenue = {
  date: string;
  amount: number;
  count: number;
};

export type AuctionSessionHistory = {
  auctionId: number;
  productId: number;
  productName: string;
  sellerName: string;
  buyerName: string;
  finalPrice: number;
  auctionStatus: string;
  paymentStatus: string | null;
  paymentCategory: string;
  endTime: string | null;
  paidAt: string | null;
  paymentDeadline: string | null;
};

export type SalesHistory = {
  auctionId: number;
  productId: number;
  productName: string;
  sellerName: string;
  buyerName: string;
  finalPrice: number;
  commission: number;
  sellerPayout: number;
  status: string;
  paymentStatus: string | null;
  paidAt: string | null;
};

export type ReviewProduct = {
  productId: number;
  sellerId: number;
  categoryId: number;
  categoryName: string;
  productName: string;
  description: string | null;
  startingPrice: number;
  stepPrice: number | null;
  taxPercent: number | null;
  status: string;
  submittedAt: string | null;
  createdAt: string;
  rejectionReason: string | null;
  auctionMode: "LIVE" | "TIMED" | null;
  scheduledStartTime: string | null;
  scheduledDurationSeconds: number | null;
  images: Array<{ imageId: number; imageUrl: string; isPrimary: boolean }>;
  attributes: Array<{
    valueId: number;
    attributeId: number;
    attributeValue: string;
  }>;
};

export type ProductApprovalPayload = {
  auctionMode: "LIVE" | "TIMED";
  scheduledStartTime: string;
  scheduledDurationSeconds: number | null;
};

export type KycImageAnalysis = {
  riskScore: number;
  severity: string;
  signals: Array<{ severity: string; message: string }>;
};

export type KycReview = {
  kycId: number;
  userId: number;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  cccdNumber: string | null;
  dob: string | null;
  gender: string | null;
  issueDate: string | null;
  issuePlace: string | null;
  frontImageUrl: string | null;
  backImageUrl: string | null;
  selfieImageUrl: string | null;
  status: string;
  submittedAt: string | null;
  processedAt: string | null;
  processedByName: string | null;
  rejectionReason: string | null;
  frontImageAnalysis?: KycImageAnalysis | null;
  backImageAnalysis?: KycImageAnalysis | null;
  selfieImageAnalysis?: KycImageAnalysis | null;
  cccdDuplicate?: boolean;
};

export type AccountSummary = {
  profile: UserProfile;
  wallet: WalletInfo;
};

type PublicStatsResponse = {
  totalProducts: number;
  totalUsers: number;
  activeAuctions: number;
  completedAuctions: number;
};

/** Map role backend (Admin/Staff/Seller/User) sang role FE dùng trong cookie/proxy. */
export function toFrontendRole(
  roleName: string | null,
): "admin" | "staff" | "seller" | "collector" {
  switch ((roleName ?? "").toLowerCase()) {
    case "admin":
      return "admin";
    case "staff":
      return "staff";
    case "seller":
      return "seller";
    default:
      return "collector";
  }
}

// ---------------------------------------------------------------------------
// AUTH — /api/auth/*
// ---------------------------------------------------------------------------
export const authApi = {
  async login(usernameOrEmail: string, password: string) {
    const res = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ usernameOrEmail, password }),
      auth: false,
    });
    storeLoginResponse(res);
    return res;
  },
  register(data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    return apiFetch<{ success: boolean; message: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
      auth: false,
    });
  },
  sendRegistrationEmailCode(email: string) {
    return apiFetch<{ success: boolean; message: string }>(
      "/auth/register/email/send-code",
      {
        method: "POST",
        body: JSON.stringify({ email }),
        auth: false,
      },
    );
  },
  verifyRegistrationEmailCode(email: string, code: string) {
    return apiFetch<{
      success: boolean;
      message: string;
      registrationToken: string;
    }>("/auth/register/email/verify-code", {
      method: "POST",
      body: JSON.stringify({ email, code }),
      auth: false,
    });
  },
  verifyEmail(token: string) {
    return apiFetch<{ success: boolean; message: string }>(
      `/auth/verify-email?token=${encodeURIComponent(token)}`,
      { auth: false },
    );
  },
  resendEmailVerification(email: string) {
    return apiFetch<{ success: boolean; message: string }>(
      "/auth/email-verification/resend",
      {
        method: "POST",
        body: JSON.stringify({ email }),
        auth: false,
      },
    );
  },
  async googleLogin(credential: string) {
    const res = await apiFetch<LoginResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
      auth: false,
    });
    storeLoginResponse(res);
    return res;
  },
  logout() {
    setAuthRoleCookie(null);
    setToken(null);
  },
};

// ---------------------------------------------------------------------------
// PRODUCTS & CATEGORIES — public
// ---------------------------------------------------------------------------
export const productApi = {
  search(params: {
    keyword?: string;
    categoryId?: number;
    auctionStatus?: string;
    page?: number;
    size?: number;
  }) {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
    }
    return apiFetch<PageResponse<ProductSummary>>(`/products?${q}`, {
      auth: false,
    });
  },
  detail(productId: number) {
    return apiFetch<ProductDetail>(`/products/${productId}`, {
      auth: false,
    });
  },
  categories() {
    return apiFetch<ApiEnvelope<Category[]>>("/categories", { auth: false });
  },
  categoryAttributes(categoryId: number) {
    return apiFetch<ApiEnvelope<CategoryAttribute[]>>(
      `/categories/${categoryId}/attributes`,
      { auth: false },
    );
  },
  featured() {
    return apiFetch<unknown>("/featured-products", { auth: false });
  },
  mine() {
    return apiFetch<ApiEnvelope<SellerProduct[]>>("/seller/products/mine");
  },
  sellerDetail(productId: number) {
    return apiFetch<ApiEnvelope<SellerEditableProduct>>(`/seller/products/${productId}`);
  },
  create(payload: CreateProductPayload) {
    return apiFetch<ApiEnvelope<{ productId: number }>>("/seller/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update(productId: number, payload: UpdateProductPayload) {
    return apiFetch<ApiEnvelope<SellerEditableProduct>>(`/seller/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};

export type CreateProductImage = { imageUrl: string; isPrimary?: boolean };

export type CreateProductPayload = {
  categoryId: number;
  productName: string;
  description?: string;
  startingPrice: number;
  stepPrice?: number;
  images?: CreateProductImage[];
};

export type UpdateProductPayload = {
  productName: string;
  description?: string;
  startingPrice: number;
  images: CreateProductImage[];
};

// ---------------------------------------------------------------------------
// AI VALUATION — /api/ai/valuation
// ---------------------------------------------------------------------------
export type AiValuationResult = {
  reply: string | null;
  summary: string | null;
  lowEstimate: number | null;
  highEstimate: number | null;
  currency: string | null;
};

export type AiValuationPayload = {
  productName: string;
  description?: string;
  startingPrice?: number;
  images?: { mimeType: string; base64: string }[];
};

export const aiApi = {
  valuation(payload: AiValuationPayload) {
    return apiFetch<ApiEnvelope<AiValuationResult>>("/ai/valuation", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

// ---------------------------------------------------------------------------
// KYC — /api/kyc/*
// ---------------------------------------------------------------------------
export type CccdOcrResult = {
  success: boolean;
  fullName?: string | null;
  cccdNumber?: string | null;
  dob?: string | null;
  gender?: string | null;
  issueDate?: string | null;
  issuePlace?: string | null;
  message?: string | null;
};

export type KycSubmitPayload = {
  fullName: string;
  cccdNumber: string;
  dob: string; // yyyy-MM-dd
  gender: string;
  issueDate: string; // yyyy-MM-dd
  issuePlace: string;
  frontImage: File;
  backImage: File;
  selfieImage: File;
  signSellerAgreement?: boolean;
};

export const kycApi = {
  ocr(frontImage: File, backImage: File) {
    const form = new FormData();
    form.append("frontImage", frontImage);
    form.append("backImage", backImage);
    return postMultipart<ApiEnvelope<CccdOcrResult>>("/kyc/ocr", form);
  },
  submit(payload: KycSubmitPayload) {
    const form = new FormData();
    form.append("fullName", payload.fullName);
    form.append("cccdNumber", payload.cccdNumber);
    form.append("dob", payload.dob);
    form.append("gender", payload.gender);
    form.append("issueDate", payload.issueDate);
    form.append("issuePlace", payload.issuePlace);
    form.append("frontImage", payload.frontImage);
    form.append("backImage", payload.backImage);
    form.append("selfieImage", payload.selfieImage);
    form.append("signSellerAgreement", String(payload.signSellerAgreement ?? false));
    return postMultipart<ApiEnvelope<unknown>>("/kyc", form);
  },
  mine() {
    return apiFetch<ApiEnvelope<KycReview | null>>("/kyc/me");
  },
  /** Fetch a private KYC image (owner or staff only) as a blob for rendering. */
  async imageBlob(kycId: number, which: "front" | "back" | "selfie"): Promise<Blob> {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/kyc/${kycId}/image/${which}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new ApiError(res.status, `HTTP ${res.status}`);
    return res.blob();
  },
};

// ---------------------------------------------------------------------------
// SELLER CONTRACT — /api/seller-contract/*
// ---------------------------------------------------------------------------
export const sellerContractApi = {
  /** Fetch the seller agreement preview PDF as a blob (needs JWT header). */
  async previewPdf(): Promise<Blob> {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/seller-contract/preview-pdf`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new ApiError(res.status, `HTTP ${res.status}`);
    return res.blob();
  },
  /** Fetch the persisted signed agreement PDF. */
  async signedPdf(): Promise<Blob> {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/seller-contract/me/pdf`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new ApiError(res.status, `HTTP ${res.status}`);
    return res.blob();
  },
  /**
   * Sign the seller agreement and upgrade User -> Seller immediately.
   * Requires an APPROVED KYC (identityVerified) — enforced server-side.
   */
  submit() {
    return apiFetch<ApiEnvelope<{ signed: boolean; roleName: string; roleUpgraded: boolean }>>(
      "/seller-contract/submit",
      { method: "POST" },
    );
  },
  mine() {
    return apiFetch<ApiEnvelope<{ signed: boolean; contractId: number | null }>>(
      "/seller-contract/me",
    );
  },
};

/**
 * Re-sync the role cookie (used by proxy.ts routing) after a role change that
 * happens without re-login — e.g. the User -> Seller upgrade.
 */
export function updateRoleCookie(roleName: string | null) {
  setAuthRoleCookie(toFrontendRole(roleName));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_STATE_EVENT));
  }
}

// ---------------------------------------------------------------------------
// AUCTIONS & BIDDING — /api/auctions/*, /api/bidding/*
// ---------------------------------------------------------------------------
export const auctionApi = {
  state(auctionId: number) {
    return apiFetch<AuctionState>(`/auctions/${auctionId}/state`, {
      auth: false,
    });
  },
  bids(auctionId: number) {
    return apiFetch<BidRecord[]>(`/auctions/${auctionId}/bids`, {
      auth: false,
    });
  },
  eligibility(auctionId: number) {
    return apiFetch<AuctionEligibility>(`/auctions/${auctionId}/eligibility`);
  },
  /** Bid cao nhất của CHÍNH người gọi — luôn xem được, kể cả phiên giá kín. */
  myBid(auctionId: number) {
    return apiFetch<{ hasBid: boolean; bidAmount: number | null; bidTime: string | null }>(
      `/auctions/${auctionId}/my-bid`,
    );
  },
  placeBid(auctionId: number, bidAmount: number) {
    return apiFetch<BidResult>(`/auctions/${auctionId}/bid`, {
      method: "POST",
      body: JSON.stringify({ bidAmount }),
    });
  },
  pay(auctionId: number) {
    return apiFetch<Record<string, unknown>>(`/auctions/${auctionId}/pay`, {
      method: "POST",
    });
  },
  purchaseContract(auctionId: number) {
    return apiFetch<PurchaseContractPreview>(`/auctions/${auctionId}/purchase-contract`);
  },
  signPurchaseContract(auctionId: number) {
    return apiFetch<Record<string, unknown>>(`/auctions/${auctionId}/purchase-contract/sign`, {
      method: "POST",
    });
  },
  async purchaseContractPdf(auctionId: number): Promise<Blob> {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/auctions/${auctionId}/purchase-contract/pdf`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new ApiError(res.status, `HTTP ${res.status}`);
    return res.blob();
  },
  deposit(auctionId: number) {
    return apiFetch<AuctionDepositResult>(`/deposits?auctionId=${auctionId}`, {
      method: "POST",
    });
  },
  rooms() {
    return apiFetch<unknown[]>("/bidding/rooms");
  },
  chatMessages(auctionId: number) {
    return apiFetch<unknown[]>(`/auctions/${auctionId}/chat/messages`, {
      auth: false,
    });
  },
  myBids() {
    return apiFetch<ApiEnvelope<UserBid[]>>("/bids/my-bids");
  },
  wonAuctions() {
    return apiFetch<ApiEnvelope<WonAuction[]>>("/bids/won");
  },
};

// ---------------------------------------------------------------------------
// WALLET — /api/wallet*
// ---------------------------------------------------------------------------
export const walletApi = {
  get() {
    return apiFetch<WalletInfo>("/wallet");
  },
  transactions() {
    return apiFetch<WalletTransaction[]>("/wallet/transactions");
  },
  deposit(amount: number) {
    return apiFetch<DepositQrResponse>("/wallet/deposit", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  },
  withdraw(data: {
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
  }) {
    return apiFetch<Record<string, unknown>>("/wallet/withdraw", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  withdrawals() {
    return apiFetch<Withdrawal[]>("/wallet/withdrawals");
  },
};

// ---------------------------------------------------------------------------
// USER — profile, notifications, watchlist, KYC
// ---------------------------------------------------------------------------
export type KycSubmission = {
  kycId: number;
  userId: number;
  fullName: string;
  email: string | null;
  phone: string;
  cccdNumber: string;
  dob: string;
  gender: string;
  issueDate: string;
  issuePlace: string;
  frontImageUrl: string | null;
  backImageUrl: string | null;
  selfieImageUrl: string | null;
  status: string;
  submittedAt: string;
  processedAt: string | null;
  processedByName: string | null;
  rejectionReason: string | null;
};

export const userApi = {
  profile() {
    return apiFetch<ApiEnvelope<UserProfile>>("/users/me/profile");
  },
  updateProfile(fullName: string) {
    return apiFetch<ApiEnvelope<UserProfile>>("/users/me/profile", {
      method: "PUT",
      body: JSON.stringify({ fullName }),
    });
  },
  sendPhoneVerification(phone: string, channel: "SMS" | "WHATSAPP") {
    return apiFetch<ApiEnvelope<UserProfile>>(
      "/users/me/phone-verification/send",
      {
        method: "POST",
        body: JSON.stringify({ phone, channel }),
      },
    );
  },
  checkPhoneVerification(code: string) {
    return apiFetch<ApiEnvelope<UserProfile>>(
      "/users/me/phone-verification/check",
      {
        method: "POST",
        body: JSON.stringify({ code }),
      },
    );
  },
  changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    return apiFetch<ApiEnvelope<null>>("/users/me/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  notifications() {
    return apiFetch<unknown[]>("/notifications");
  },
  unreadCount() {
    return apiFetch<Record<string, unknown>>("/notifications/unread-count");
  },
  markNotificationRead(id: number) {
    return apiFetch(`/notifications/${id}/read`, { method: "POST" });
  },
  watchlist() {
    return apiFetch<ApiEnvelope<WatchlistEntry[]>>("/watchlist");
  },
  addToWatchlist(productId: number) {
    return apiFetch<{ success: boolean; message: string }>(`/watchlist/${productId}`, {
      method: "POST",
    });
  },
  removeFromWatchlist(productId: number) {
    return apiFetch(`/watchlist/${productId}`, { method: "DELETE" });
  },
  myKyc() {
    return apiFetch<{ success: boolean; data: KycSubmission | null }>(
      "/kyc/me",
    );
  },
  submitKyc(formData: FormData) {
    return apiFetch<{ success: boolean; message: string; data: KycSubmission }>(
      "/kyc",
      { method: "POST", body: formData },
    );
  },
  myConversations() {
    return apiFetch<Conversation[]>("/v1/conversations/my");
  },
  createConversation(data: {
    type: "BUYER_STAFF" | "SELLER_STAFF" | "BUYER_SELLER";
    subject: string;
    firstMessage: string;
    sellerEmail?: string;
    productId?: number;
  }) {
    return apiFetch<Conversation>("/v1/conversations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  conversationMessages(conversationId: number) {
    return apiFetch<ConversationMessage[]>(
      `/v1/messages/conversation/${conversationId}`,
    );
  },
  markConversationRead(conversationId: number) {
    return apiFetch<void>(`/v1/messages/conversation/${conversationId}/read`, {
      method: "PATCH",
    });
  },
  sendMessage(conversationId: number, content: string) {
    return apiFetch<ConversationMessage>("/v1/messages", {
      method: "POST",
      body: JSON.stringify({ conversationId, content }),
    });
  },
  // --- Staff support inbox ---
  assignedConversations() {
    return apiFetch<Conversation[]>("/v1/conversations/assigned");
  },
  unassignedConversations() {
    return apiFetch<Conversation[]>("/v1/conversations/unassigned");
  },
  assignConversation(conversationId: number) {
    return apiFetch<Conversation>(`/v1/conversations/${conversationId}/assign`, {
      method: "PATCH",
    });
  },
  closeConversation(conversationId: number) {
    return apiFetch<Conversation>(`/v1/conversations/${conversationId}/close`, {
      method: "PATCH",
    });
  },
};

export async function fetchAccountSummary(): Promise<AccountSummary> {
  const [profile, wallet] = await Promise.all([
    userApi.profile(),
    walletApi.get(),
  ]);
  return { profile: profile.data, wallet };
}

export async function fetchPublicStats(): Promise<TrustStat[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/stats`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return [];
    const stats = (await response.json()) as PublicStatsResponse;
    return [
      { id: "products", value: stats.totalProducts.toLocaleString("vi-VN"), label: "Sản phẩm" },
      { id: "members", value: stats.totalUsers.toLocaleString("vi-VN"), label: "Thành viên" },
      { id: "active-auctions", value: stats.activeAuctions.toLocaleString("vi-VN"), label: "Phiên đang chạy" },
      { id: "completed-auctions", value: stats.completedAuctions.toLocaleString("vi-VN"), label: "Phiên hoàn tất" },
    ];
  } catch {
    return [];
  }
}

export const adminApi = {
  summary() {
    return apiFetch<ApiEnvelope<AdminDashboardSummary>>("/admin/dashboard/summary");
  },
  revenue() {
    return apiFetch<ApiEnvelope<DailyRevenue[]>>("/admin/dashboard/revenue");
  },
  salesHistory() {
    return apiFetch<ApiEnvelope<SalesHistory[]>>("/admin/dashboard/sales-history");
  },
  auctionSessions(payment = "ALL") {
    return apiFetch<ApiEnvelope<AuctionSessionHistory[]>>(
      `/admin/dashboard/auction-sessions?payment=${payment}`,
    );
  },
  categories() {
    return apiFetch<ApiEnvelope<Category[]>>("/admin/categories");
  },
  createCategory(categoryName: string, description: string) {
    return apiFetch<ApiEnvelope<Category>>("/admin/categories", {
      method: "POST",
      body: JSON.stringify({ categoryName, description, isActive: true }),
    });
  },
  deleteCategory(categoryId: number) {
    return apiFetch<ApiEnvelope<null>>(`/admin/categories/${categoryId}`, {
      method: "DELETE",
    });
  },
  pendingProducts() {
    return apiFetch<ApiEnvelope<ReviewProduct[]>>("/admin/products/pending");
  },
  approveProduct(productId: number, payload: ProductApprovalPayload) {
    return apiFetch<ApiEnvelope<ReviewProduct>>(`/admin/products/${productId}/approve`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  rejectProduct(productId: number, reason = "") {
    return apiFetch<ApiEnvelope<ReviewProduct>>(`/admin/products/${productId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },
  // KYC review — backend returns a raw List (not an ApiEnvelope) for /kyc/list.
  kycList(status = "PENDING") {
    return apiFetch<KycReview[]>(`/kyc/list?status=${encodeURIComponent(status)}`);
  },
  approveKyc(kycId: number) {
    return apiFetch<ApiEnvelope<KycReview>>(`/kyc/${kycId}/approve`, { method: "POST" });
  },
  // reason is a @RequestParam on the backend, so it goes in the query string.
  rejectKyc(kycId: number, reason: string) {
    return apiFetch<ApiEnvelope<KycReview>>(
      `/kyc/${kycId}/reject?reason=${encodeURIComponent(reason)}`,
      { method: "POST" },
    );
  },
  requestInfoKyc(kycId: number, reason: string) {
    return apiFetch<ApiEnvelope<KycReview>>(
      `/kyc/${kycId}/request-info?reason=${encodeURIComponent(reason)}`,
      { method: "POST" },
    );
  },
  // --- Users & roles (Admin only) ---
  users(q = "") {
    const qs = q ? `?q=${encodeURIComponent(q)}` : "";
    return apiFetch<ApiEnvelope<AdminUser[]>>(`/admin/users${qs}`);
  },
  userStats() {
    return apiFetch<ApiEnvelope<Record<string, number>>>("/admin/users/stats");
  },
  updateUserRole(userId: number, roleName: string) {
    return apiFetch<ApiEnvelope<AdminUser>>(`/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ roleName }),
    });
  },
  updateUserStatus(userId: number, active: boolean) {
    return apiFetch<ApiEnvelope<AdminUser>>(`/admin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ active }),
    });
  },
  // --- Withdrawals (Staff/Admin) — backend returns raw lists, no envelope ---
  withdrawals(status = "") {
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";
    return apiFetch<Withdrawal[]>(`/staff/withdrawals${qs}`);
  },
  updateWithdrawal(id: number, status: string, staffNote = "") {
    return apiFetch<Withdrawal>(`/staff/withdrawals/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, staffNote }),
    });
  },
  // --- Contracts & ledger (Admin/Staff dashboard) ---
  contracts(cccd = "") {
    const qs = cccd ? `?cccd=${encodeURIComponent(cccd)}` : "";
    return apiFetch<ApiEnvelope<ContractRow[]>>(`/admin/dashboard/contracts${qs}`);
  },
  async contractPdfBlob(contractId: number): Promise<Blob> {
    const token = getToken();
    const res = await fetch(
      `${API_BASE_URL}/admin/dashboard/contracts/${contractId}/pdf`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    );
    if (!res.ok) throw new ApiError(res.status, `HTTP ${res.status}`);
    return res.blob();
  },
  balanceLedger(params: { from?: string; to?: string; userId?: number; type?: string } = {}) {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
    }
    const qs = q.toString() ? `?${q}` : "";
    return apiFetch<ApiEnvelope<WalletTransaction[]>>(`/admin/dashboard/balance-ledger${qs}`);
  },
};

export type AdminUser = {
  userId: number;
  fullName: string | null;
  email: string;
  phone: string | null;
  identityNumber: string | null;
  latestKycCccd: string | null;
  roleName: string | null;
  status: string | null;
  profileStatus: string | null;
  active: boolean;
  emailVerified: boolean;
  identityVerified: boolean;
  paymentStrikeCount: number;
  lockedByPaymentStrikes: boolean;
};

export type ContractRow = {
  contractId: number;
  contractType: string | null;
  typeLabel: string | null;
  referenceId: number | null;
  referenceName: string | null;
  identityNumber: string | null;
  fileUrl: string | null;
  createdAt: string | null;
};

export const chatbotApi = {
  reply(message: string) {
    return apiFetch<{ reply: string; aiGenerated: boolean }>("/public/chatbot", {
      method: "POST",
      body: JSON.stringify({ message }),
      auth: false,
    });
  },
};

// ---------------------------------------------------------------------------
// HOME — dữ liệu trang chủ (server component dùng được, không cần token)
// ---------------------------------------------------------------------------
const VND = new Intl.NumberFormat("vi-VN");

export function toImageSrc(imageUrl: string | null): string {
  if (!imageUrl) return "/images/auction-products/placeholder.png";
  if (imageUrl.startsWith("http")) return imageUrl;
  // Backend trả đường dẫn tương đối (/uploads/...) — đi qua rewrite trong next.config.ts
  return imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
}

function toLiveAuctionItem(p: ProductSummary): LiveAuctionItem {
  const price = p.currentBid && p.currentBid > 0 ? p.currentBid : p.startingPrice;
  return {
    id: String(p.auctionId ?? p.productId),
    title: p.productName,
    subtitle: p.categoryName ?? "",
    currentPrice: `${VND.format(price)} ₫`,
    estimatedPrice: `Giá khởi điểm ${VND.format(p.startingPrice)} ₫`,
    bidCount: p.totalBids ?? 0,
    endsAt: p.auctionEndTime ? new Date(p.auctionEndTime).getTime() : Date.now(),
    imageSrc: toImageSrc(p.imageUrl),
  };
}

/** Lấy các phiên đấu giá đang diễn ra từ backend. Trả [] nếu backend chưa chạy. */
export async function fetchLiveAuctions(limit = 5): Promise<LiveAuctionItem[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/products?auctionStatus=ACTIVE&size=${limit}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      },
    );
    if (!res.ok) return [];
    const page = (await res.json()) as PageResponse<ProductSummary>;
    return (page.content ?? [])
      .filter((p) => p.auctionId != null)
      .map(toLiveAuctionItem);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// STOREFRONT — lot + danh mục thật từ DB (dùng ở server components)
// ---------------------------------------------------------------------------
export type StorefrontLot = {
  id: string;
  lotNumber: string;
  title: string;
  categoryId: string;
  categoryLabel: string;
  currentBid: number;
  timeLeft: string;
  /** Auction end time (epoch ms) so the card can run a live countdown. */
  endsAt: number | null;
  isLive: boolean;
  auctionStatus: string | null;
  image: string;
};

export type StorefrontCategory = {
  id: string;
  label: string;
  icon: string;
  count: string;
  description: string;
  imageSrc: string;
};

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const CATEGORY_ICONS: Record<string, string> = {
  "luxury-watch": "watch",
  "dong-ho": "watch",
  art: "palette",
  "tranh-nghe-thuat": "palette",
  jewelry: "diamond",
  "trang-suc": "diamond",
  automotive: "directions_car",
  furniture: "chair",
  ceramics: "emoji_food_beverage",
  "do-co": "museum",
};

const CATEGORY_IMAGES: Record<string, string> = {
  art: "/images/categories/art.jpg",
  "tranh-nghe-thuat": "/images/categories/art.jpg",
  "luxury-watch": "/images/categories/watch.jpg",
  "dong-ho": "/images/categories/watch.jpg",
  jewelry: "/images/categories/jewelry.jpg",
  "trang-suc": "/images/categories/jewelry.jpg",
  automotive: "/images/categories/automotive.jpg",
  furniture: "/images/categories/furniture.jpg",
  ceramics: "/images/categories/ceramics.jpg",
  "do-co": "/images/categories/antiques.jpg",
  khac: "/images/categories/collectibles.jpg",
};

function formatTimeLeft(endTime: string | null): string {
  if (!endTime) return "—";
  const ms = new Date(endTime).getTime() - Date.now();
  if (ms <= 0) return "Đã kết thúc";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function toStorefrontLot(p: ProductSummary): StorefrontLot {
  return {
    id: String(p.auctionId),
    lotNumber: `LOT ${String(p.productId).padStart(3, "0")}`,
    title: p.productName,
    categoryId: slugify(p.categoryName ?? "khac"),
    categoryLabel: p.categoryName ?? "Khác",
    currentBid:
      p.currentBid && p.currentBid > 0 ? p.currentBid : p.startingPrice,
    timeLeft: formatTimeLeft(p.auctionEndTime),
    endsAt: p.auctionEndTime ? new Date(p.auctionEndTime).getTime() : null,
    isLive: p.auctionStatus === "ACTIVE",
    auctionStatus: p.auctionStatus,
    image: toImageSrc(p.imageUrl),
  };
}

/** Toàn bộ lot có phiên đấu giá từ DB. Trả [] nếu backend chưa chạy. */
export async function fetchStorefrontLots(limit = 60): Promise<StorefrontLot[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products?size=${limit}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const page = (await res.json()) as PageResponse<ProductSummary>;
    return (page.content ?? [])
      .filter((p) => p.auctionId != null)
      .map(toStorefrontLot);
  } catch {
    return [];
  }
}

/** Danh mục thật từ DB, kèm số lot đang có phiên trong từng danh mục. */
export async function fetchStorefrontCategories(
  lots?: StorefrontLot[],
): Promise<StorefrontCategory[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const body = (await res.json()) as ApiEnvelope<Category[]>;
    const allLots = lots ?? (await fetchStorefrontLots());
    return (body.data ?? [])
      .filter((c) => c.isActive)
      .map((c) => {
        const slug = slugify(c.categoryName);
        const inCategory = allLots.filter((lot) => lot.categoryId === slug);
        return {
          id: slug,
          label: c.categoryName,
          icon: CATEGORY_ICONS[slug] ?? "category",
          count: String(inCategory.length),
          description: c.description ?? "",
          imageSrc:
            CATEGORY_IMAGES[slug] ?? "/images/categories/collectibles.jpg",
        };
      });
  } catch {
    return [];
  }
}
