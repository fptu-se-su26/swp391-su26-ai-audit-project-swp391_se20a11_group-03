"use client";

import { useState } from "react";
import CollectorShell from "@/components/layout/CollectorShell";

export default function PostItemPage() {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  const handleAiValuation = () => {
    setAiLoading(true);
    setAiResult(null);
    setTimeout(() => {
      setAiLoading(false);
      setAiResult("Estimated Market Value: $175,000 – $220,000 based on 42 comparable sales in the last 12 months.");
    }, 1800);
  };

  return (
    <CollectorShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary">Post New Item</h1>
          <p className="font-body-lg text-on-surface-variant">Enter lot details and request AI valuation.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-lg">
          {/* Form */}
          <div className="xl:col-span-2 space-y-md">
            <div className="bg-surface rounded-xl p-lg soft-shadow border border-surface-variant space-y-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant">Item Title</label>
                  <input
                    type="text"
                    placeholder="e.g. 1964 Rolex Daytona 'Big Red'"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none"
                  />
                </div>
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant">Category</label>
                  <select className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none appearance-none">
                    <option>Select Category</option>
                    <option>Watches</option>
                    <option>Real Estate</option>
                    <option>Automotive</option>
                    <option>Fine Art</option>
                    <option>Wine & Spirits</option>
                  </select>
                </div>
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant">Starting Bid Price ($)</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none"
                />
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant">Lot Description & Condition Report</label>
                <textarea
                  rows={6}
                  placeholder="Provide a detailed description of the item and its current condition..."
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none resize-none"
                />
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant">Upload High-Res Images</label>
                <div className="border-2 border-dashed border-outline-variant rounded-xl p-xl flex flex-col items-center justify-center gap-sm bg-surface-container-lowest hover:bg-surface-container-low transition-colors cursor-pointer group">
                  <span className="material-symbols-outlined text-[48px] text-outline group-hover:text-secondary transition-colors">photo_camera</span>
                  <div className="text-center">
                    <p className="font-label-md text-primary">Click or drag images to upload</p>
                    <p className="text-xs text-on-surface-variant">Support for JPG, PNG, TIFF (Max 20MB per file)</p>
                  </div>
                </div>
              </div>
            </div>

            <button className="bg-secondary text-on-secondary py-md rounded-xl font-headline-sm glow-accent w-full hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed transition-all flex items-center justify-center gap-sm">
              <span className="material-symbols-outlined">send</span>
              Submit for Review
            </button>
            <p className="text-center text-xs text-on-surface-variant italic">
              By submitting, you agree to LuxeAuction's Consignment Terms & Conditions.
            </p>
          </div>

          {/* AI Assistant */}
          <div className="space-y-md">
            <div className="bg-primary-container text-on-primary-container rounded-xl p-lg soft-shadow border border-secondary/20 sticky top-base">
              <div className="flex items-center gap-sm mb-md">
                <h2 className="font-headline-md text-headline-md text-primary">✨ AI Valuation Assistant</h2>
              </div>
              <p className="font-body-md opacity-90 mb-lg">
                Upload images and description to get real-time market estimates based on recent auction results. Our AI analyzes
                historical data from over 5,000 global auction houses.
              </p>

              {aiResult && (
                <div className="mb-md p-md bg-secondary/10 border border-secondary/30 rounded-lg">
                  <p className="font-body-md text-sm text-on-primary-container">{aiResult}</p>
                </div>
              )}

              <button
                onClick={handleAiValuation}
                disabled={aiLoading}
                className="border border-secondary text-secondary hover:bg-secondary/10 w-full py-sm rounded-lg transition-colors font-label-md flex items-center justify-center gap-xs disabled:opacity-60"
              >
                {aiLoading ? (
                  <><span className="material-symbols-outlined animate-spin text-[20px]">sync</span> Analyzing...</>
                ) : (
                  <><span className="material-symbols-outlined text-[20px]">analytics</span> Get AI Valuation</>
                )}
              </button>

              <div className="mt-lg pt-md border-t border-outline-variant/20">
                <div className="flex justify-between items-center opacity-70">
                  <span className="text-xs">Processing Credits</span>
                  <span className="text-xs font-bold">12 Left</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CollectorShell>
  );
}
