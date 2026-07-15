"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import AdminShell from "@/components/layout/AdminShell";
import {
  AdminCategory,
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
} from "@/lib/services/adminService";

const emptyForm: AdminCategory = {
  categoryName: "",
  description: "",
  isActive: true,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [form, setForm] = useState<AdminCategory>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setCategories(await getAdminCategories());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        categoryName: form.categoryName.trim(),
        description: form.description?.trim() || null,
        isActive: form.isActive ?? true,
      };

      if (editingId) {
        await updateAdminCategory(editingId, payload);
        setMessage("Category updated");
      } else {
        await createAdminCategory(payload);
        setMessage("Category created");
      }

      resetForm();
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot save category");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (category: AdminCategory) => {
    setEditingId(category.categoryId ?? null);
    setForm({
      categoryName: category.categoryName,
      description: category.description ?? "",
      isActive: category.isActive ?? true,
    });
    setMessage("");
    setError("");
  };

  const removeCategory = async (category: AdminCategory) => {
    if (!category.categoryId) return;
    setError("");
    setMessage("");
    try {
      await deleteAdminCategory(category.categoryId);
      setMessage("Category deleted");
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot delete category");
    }
  };

  return (
    <AdminShell>
      <div className="mx-auto max-w-[1400px] space-y-lg p-margin-mobile md:p-margin-desktop">
        <div>
          <h1 className="font-display-lg-mobile text-primary md:font-display-lg">Category Management</h1>
          <p className="mt-xs font-body-lg text-on-surface-variant">
            Control the product categories available to sellers and buyers.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-lg xl:grid-cols-[420px_1fr]">
          <form onSubmit={handleSubmit} className="rounded-xl border border-surface-variant bg-surface p-lg soft-shadow">
            <h2 className="mb-md font-headline-sm text-headline-sm text-primary">
              {editingId ? "Edit category" : "Create category"}
            </h2>
            <div className="space-y-md">
              <div>
                <label className="mb-xs block font-label-md text-label-md text-on-surface-variant">Name</label>
                <input
                  value={form.categoryName}
                  onChange={(event) => setForm((current) => ({ ...current, categoryName: event.target.value }))}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-md py-sm outline-none focus:border-secondary"
                  required
                  maxLength={100}
                />
              </div>
              <div>
                <label className="mb-xs block font-label-md text-label-md text-on-surface-variant">Description</label>
                <textarea
                  value={form.description ?? ""}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-outline-variant bg-surface-container-low px-md py-sm outline-none focus:border-secondary"
                  maxLength={500}
                />
              </div>
              <label className="flex items-center gap-sm font-label-md text-label-md text-on-surface">
                <input
                  type="checkbox"
                  checked={form.isActive ?? true}
                  onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                />
                Active
              </label>
              <div className="flex gap-sm">
                <button
                  disabled={saving}
                  className="flex-1 rounded-lg bg-secondary px-md py-sm font-label-md text-label-md text-on-secondary hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? "Saving..." : editingId ? "Save changes" : "Create"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-outline-variant px-md py-sm font-label-md text-label-md hover:bg-surface-container-low"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>

          <section className="rounded-xl border border-surface-variant bg-surface p-lg soft-shadow">
            <div className="mb-md flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-primary">Categories</h2>
              <button
                onClick={() => void loadCategories()}
                className="rounded-lg border border-outline-variant px-md py-sm font-label-md text-label-md hover:bg-surface-container-low"
              >
                Refresh
              </button>
            </div>

            {error && <div className="mb-md rounded-lg bg-error-container px-md py-sm text-on-error-container">{error}</div>}
            {message && <div className="mb-md rounded-lg bg-tertiary-fixed px-md py-sm text-on-tertiary-fixed-variant">{message}</div>}

            {loading ? (
              <div className="py-xl text-center text-on-surface-variant">Loading categories...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-surface-variant bg-surface-container-low">
                      {["Name", "Description", "Status", "Actions"].map((heading) => (
                        <th key={heading} className="p-md font-label-sm text-label-sm text-on-surface-variant">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.categoryId} className="border-b border-surface-variant hover:bg-surface-container-lowest">
                        <td className="p-md font-label-md text-label-md text-primary">{category.categoryName}</td>
                        <td className="max-w-[360px] p-md text-sm text-on-surface-variant">
                          {category.description || "-"}
                        </td>
                        <td className="p-md">
                          <span className={category.isActive ? "text-on-tertiary-container" : "text-error"}>
                            {category.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>
                        <td className="p-md">
                          <div className="flex gap-xs">
                            <button
                              onClick={() => startEdit(category)}
                              className="rounded-lg border border-outline-variant px-sm py-xs font-label-sm text-label-sm hover:bg-surface-container-low"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => void removeCategory(category)}
                              className="rounded-lg bg-error-container px-sm py-xs font-label-sm text-label-sm text-on-error-container hover:opacity-90"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
