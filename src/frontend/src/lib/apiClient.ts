const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8096/api";

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
  token?: string | null;
};

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  // Check standalone token keys first
  const standalone = localStorage.getItem("token")
    ?? localStorage.getItem("accessToken")
    ?? localStorage.getItem("authToken")
    ?? localStorage.getItem("jwt");
  if (standalone) return standalone;

  // Fall back to token stored inside the currentUser JSON object
  try {
    const raw = localStorage.getItem("currentUser");
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.token) return user.token;
    }
  } catch {
    // ignore parse errors
  }

  return null;
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("authToken");
  localStorage.removeItem("jwt");
  localStorage.removeItem("currentUser");
}

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  // Static assets (uploads, images) are served at root level without /api
  if (path.startsWith("/uploads/") || path.startsWith("uploads/")) {
    const base = API_BASE_URL.replace(/\/+$/, "").replace(/\/api$/, "");
    return `${base}/${path.replace(/^\/+/, "")}`;
  }

  const base = API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");
  return `${base}/${normalizedPath}`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "message" in payload
        ? String(payload.message)
        : response.statusText;
    throw new ApiError(message || `Request failed with status ${response.status}`, response.status);
  }

  return payload as T;
}

export async function apiClient<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = options.token ?? getStoredToken();
  let body = options.body;

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (
    body &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof Blob)
  ) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    body: body as BodyInit | null | undefined,
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    let payload: unknown = null;
    try {
      const contentType = response.headers.get("content-type") ?? "";
      payload = contentType.includes("application/json")
        ? await response.clone().json()
        : await response.clone().text();
    } catch {
      // ignore
    }
    console.error("[apiClient] request failed", {
      url: buildUrl(path),
      method: options.method ?? "GET",
      status: response.status,
      body: payload,
    });
  }

  return parseResponse<T>(response);
}

export { API_BASE_URL };
