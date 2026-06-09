"use client";

import { useState } from "react";
import CollectorShell from "@/components/layout/CollectorShell";

type DocStatus = "not_uploaded" | "uploaded" | "verified";

export default function KYCPage() {
  const [idStatus, setIdStatus] = useState<DocStatus>("not_uploaded");
  const [addressStatus, setAddressStatus] = useState<DocStatus>("not_uploaded");

  const UploadZone = ({
    title,
    desc,
    status,
    onUpload,
  }: {
    title: string;
    desc: string;
    status: DocStatus;
    onUpload: () => void;
  }) => (
    <div className="bg-surface rounded-xl p-lg soft-shadow border border-surface-variant">
      <div className="flex items-start justify-between mb-md">
        <div>
          <h3 className="font-headline-sm text-headline-sm text-primary">{title}</h3>
          <p className="font-body-md text-on-surface-variant mt-xs">{desc}</p>
        </div>
        {status === "verified" && (
          <span className="flex items-center gap-1 bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1 rounded-full font-label-sm text-[10px] font-bold uppercase">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Verified
          </span>
        )}
        {status === "uploaded" && (
          <span className="flex items-center gap-1 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-sm text-[10px] font-bold uppercase">
            <span className="material-symbols-outlined text-[14px]">hourglass_empty</span>
            Under Review
          </span>
        )}
      </div>

      {status === "not_uploaded" ? (
        <button
          onClick={onUpload}
          className="w-full border-2 border-dashed border-outline-variant rounded-xl p-xl flex flex-col items-center justify-center gap-sm bg-surface-container-lowest hover:bg-surface-container-low transition-colors cursor-pointer group"
        >
          <span className="material-symbols-outlined text-[48px] text-outline group-hover:text-secondary transition-colors">upload_file</span>
          <div className="text-center">
            <p className="font-label-md text-primary">Click or drag file to upload</p>
            <p className="text-xs text-on-surface-variant mt-1">JPG, PNG, PDF (Max 10MB)</p>
          </div>
        </button>
      ) : (
        <div className="flex items-center gap-sm p-md bg-surface-container-low rounded-lg border border-surface-variant">
          <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
          <span className="font-label-md text-label-md text-on-surface flex-1">
            {title.toLowerCase().replace(/ /g, "_")}_document.jpg
          </span>
          <button className="text-error hover:text-error/80 transition-colors">
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <CollectorShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[800px] mx-auto space-y-lg">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary">KYC Verification</h1>
          <p className="font-body-lg text-on-surface-variant mt-xs">
            Complete your identity verification to access full platform features.
          </p>
        </div>

        {/* Progress */}
        <div className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant">
          <div className="flex items-center justify-between mb-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">Verification Progress</span>
            <span className="font-label-md text-label-md text-secondary">
              {[idStatus, addressStatus].filter((s) => s !== "not_uploaded").length}/2 Complete
            </span>
          </div>
          <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full transition-all duration-500"
              style={{
                width: `${([idStatus, addressStatus].filter((s) => s !== "not_uploaded").length / 2) * 100}%`,
              }}
            />
          </div>
        </div>

        <UploadZone
          title="Government ID"
          desc="Passport, National ID, or Driver's License (front and back)"
          status={idStatus}
          onUpload={() => setIdStatus("uploaded")}
        />

        <UploadZone
          title="Proof of Address"
          desc="Utility bill or bank statement (issued within the last 3 months)"
          status={addressStatus}
          onUpload={() => setAddressStatus("uploaded")}
        />

        <button
          disabled={idStatus === "not_uploaded" || addressStatus === "not_uploaded"}
          className="w-full py-md rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-secondary text-on-secondary glow-accent hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed"
        >
          <span className="material-symbols-outlined">send</span>
          Submit for Verification
        </button>
      </div>
    </CollectorShell>
  );
}
