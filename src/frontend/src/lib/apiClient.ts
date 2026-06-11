const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8096/api";

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
  token?: string | null;
};

function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("token") ??
    localStorage.getItem("accessToken") ??
    localStorage.getItem("authToken") ??
    localStorage.getItem("jwt")
  );
}

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
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
    throw new Error(message || `Request failed with status ${response.status}`);
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

  return parseResponse<T>(response);
}

export { API_BASE_URL };
