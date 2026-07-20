import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const localApiBaseUrl = "http://localhost:8096/api";
const productionApiBaseUrl = "https://api.bidzone.io.vn/api";
const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const configuredForLocalhost =
  configuredApiBaseUrl?.startsWith("http://localhost") ||
  configuredApiBaseUrl?.startsWith("http://127.0.0.1");
const apiBaseUrl =
  process.env.NODE_ENV === "production" &&
  (!configuredApiBaseUrl || configuredForLocalhost)
    ? productionApiBaseUrl
    : configuredApiBaseUrl || localApiBaseUrl;
const backendOrigin = (
  process.env.BACKEND_ORIGIN ?? apiBaseUrl.replace(/\/api\/?$/, "")
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8096",
      },
      {
        protocol: "https",
        hostname: "img.vietqr.io",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${backendOrigin}/uploads/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value:
              process.env.NODE_ENV === "development"
                ? "no-store, max-age=0"
                : "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
