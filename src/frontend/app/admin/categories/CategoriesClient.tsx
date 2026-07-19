"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { adminApi, type Category } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

async function loadCategories(): Promise<Category[]> { return (await adminApi.categories()).data; }

export default function CategoriesClient() {
  const t = useTranslations("adminCategoriesPage");
  const { data: categories, setData, loading, error } = useApiData(loadCategories, []);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  async function create() { const response = await adminApi.createCategory(name, description); setData((items) => [...items, response.data]); setName(""); setDescription(""); setShowAdd(false); }
  async function remove(categoryId: number) { await adminApi.deleteCategory(categoryId); setData((items) => items.filter((item) => item.categoryId !== categoryId)); }
  return <div className="mx-auto max-w-7xl px-6 py-10"><div className="flex items-center justify-between"><h1 className="font-display-lg text-3xl">{t("title")}</h1><button type="button" onClick={() => setShowAdd(true)} className="gradient-cta rounded-full px-5 py-2.5 text-sm font-semibold text-black">{t("add")}</button></div>
    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{categories.map((category) => <div key={category.categoryId} className="glass-card rounded-2xl p-6"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--luxora-gold)]/10 text-[var(--luxora-gold)]"><span className="material-symbols-outlined">category</span></span><div><p className="font-semibold">{category.categoryName}</p><p className={`text-xs ${category.isActive ? "text-green-300" : "text-white/40"}`}>{category.isActive ? t("active") : t("hidden")}</p></div></div><p className="mt-4 min-h-10 text-sm text-white/50">{category.description || t("noDescription")}</p><button type="button" onClick={() => void remove(category.categoryId)} className="mt-4 w-full rounded-full border border-white/15 py-2 text-xs font-semibold hover:border-red-400 hover:text-red-300">{t("delete")}</button></div>)}{!loading && categories.length === 0 && <p className="col-span-full py-12 text-center text-sm text-white/45">{error ?? t("empty")}</p>}</div>
    {showAdd && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-md rounded-2xl border border-white/10 bg-[var(--luxora-bg-elevated)] p-6"><h2 className="font-headline-md text-lg">{t("newTitle")}</h2><div className="mt-4 flex flex-col gap-3"><input value={name} onChange={(event) => setName(event.target.value)} placeholder={t("namePlaceholder")} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none" /><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder={t("descriptionPlaceholder")} className="min-h-24 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none" /></div><div className="mt-6 flex gap-3"><button type="button" onClick={() => setShowAdd(false)} className="flex-1 rounded-full border border-white/15 py-2.5 text-sm font-semibold">{t("cancel")}</button><button type="button" disabled={!name.trim()} onClick={() => void create()} className="gradient-cta flex-1 rounded-full py-2.5 text-sm font-semibold text-black disabled:opacity-40">{t("create")}</button></div></div></div>}
  </div>;
}
