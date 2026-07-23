const LOCAL_API_BASE_URL = "http://localhost:8096/api";
const PRODUCTION_API_BASE_URL = "https://api.bidzone.io.vn/api";

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const configuredForLocalhost =
  configuredApiBaseUrl?.startsWith("http://localhost") ||
  configuredApiBaseUrl?.startsWith("http://127.0.0.1");

export const API_BASE_URL =
  process.env.NODE_ENV === "production" &&
  (!configuredApiBaseUrl || configuredForLocalhost)
    ? PRODUCTION_API_BASE_URL
    : configuredApiBaseUrl || LOCAL_API_BASE_URL;
