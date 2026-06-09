"use client";

import { useState } from "react";
import { mockCategories } from "@/lib/mock-data";
import AdminShell from "@/components/layout/AdminShell";

export default function CategoriesPage() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <AdminShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-display-lg-mobile md:font-display-lg text-primary">Category Management</h1>
            <p className="font-body-lg text-on-surface-variant mt-xs">Organize and configure auction categories and subcategories.</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-secondary text-on-secondary font-label-md text-label-md px-md py-sm rounded-lg flex items-center gap-xs hover:bg-secondary-fixed-dim transition-colors glow-accent"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Category
          </button>
        </div>

        {/* Add Category Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-surface rounded-2xl p-lg w-full max-w-md soft-shadow border border-surface-variant">
              <div className="flex items-center justify-between mb-lg">
                <h2 className="font-headline-md text-headline-md text-primary">New Category</h2>
                <button onClick={() => setShowAdd(false)} className="material-symbols-outlined text-outline hover:text-primary">close</button>
              </div>
              <div className="space-y-md">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Category Name</label>
                  <input className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low outline-none focus:border-secondary" placeholder="e.g. Wine & Spirits" />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Icon (Material Symbols name)</label>
                  <input className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low outline-none focus:border-secondary" placeholder="e.g. wine_bar" />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Subcategories (comma-separated)</label>
                  <input className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low outline-none focus:border-secondary" placeholder="Red Wines, White Wines, Spirits" />
                </div>
                <div className="flex justify-end gap-sm pt-sm">
                  <button onClick={() => setShowAdd(false)} className="px-lg py-sm rounded-lg border border-outline-variant font-label-md">Cancel</button>
                  <button onClick={() => setShowAdd(false)} className="px-lg py-sm rounded-lg bg-secondary text-on-secondary font-label-md glow-accent">Create</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-md">
          {mockCategories.map((cat) => (
            <div key={cat.id} className="bg-surface rounded-xl overflow-hidden soft-shadow border border-surface-variant">
              <div className="bg-primary-container/30 p-lg flex items-center gap-md">
                <div className="w-14 h-14 rounded-xl bg-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px] text-primary">{cat.icon}</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary">{cat.name}</h3>
                  <p className="font-label-md text-label-md text-on-surface-variant">{cat.count} listings</p>
                </div>
              </div>
              <div className="p-md">
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-sm">Subcategories</p>
                <div className="flex flex-wrap gap-2">
                  {cat.subcategories.map((sub) => (
                    <span key={sub} className="px-2 py-1 rounded bg-surface-container-low border border-surface-variant font-label-sm text-label-sm text-on-surface text-[11px]">
                      {sub}
                    </span>
                  ))}
                  <button className="px-2 py-1 rounded border border-dashed border-outline-variant font-label-sm text-[11px] text-outline hover:text-secondary hover:border-secondary transition-colors">
                    + Add
                  </button>
                </div>
                <div className="mt-md flex gap-sm">
                  <button className="flex-1 border border-outline-variant rounded-lg py-1.5 font-label-sm text-label-sm text-on-surface hover:bg-surface-container-low transition-colors flex items-center justify-center gap-xs text-sm">
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    Edit
                  </button>
                  <button className="px-md border border-error/20 rounded-lg py-1.5 font-label-sm text-error hover:bg-error-container/10 transition-colors">
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
