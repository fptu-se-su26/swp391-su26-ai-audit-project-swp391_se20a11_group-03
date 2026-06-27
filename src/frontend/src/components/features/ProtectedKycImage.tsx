"use client";

import { useEffect, useState } from "react";
import { resolveApiUrl } from "@/lib/apiClient";
import { fetchKycDocument } from "@/lib/services/kycService";

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
};

/** Renders KYC binaries through an authenticated fetch instead of a public img URL. */
export default function ProtectedKycImage({ src, alt, className }: Props) {
  const [displaySrc, setDisplaySrc] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;
    setDisplaySrc("");
    setFailed(false);
    if (!src) return;
    if (!src.startsWith("/kyc/")) {
      const resolved =
        src.startsWith("/uploads/") || src.startsWith("uploads/")
          ? resolveApiUrl(src)
          : src;
      setDisplaySrc(resolved);
      return;
    }
    fetchKycDocument(src)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setDisplaySrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (!displaySrc || failed) {
    return (
      <div className={`flex items-center justify-center text-on-surface-variant ${className ?? ""}`}>
        <span className="material-symbols-outlined text-3xl">image_not_supported</span>
      </div>
    );
  }
  return <img src={displaySrc} alt={alt} className={className} />;
}
