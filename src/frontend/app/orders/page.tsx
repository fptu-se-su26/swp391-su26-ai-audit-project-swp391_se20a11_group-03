"use client";
import CollectorShell from "@/components/shells/CollectorShell";
import { ApiError, orderApi, type DeliveryOrder } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";
import { useState } from "react";
const VND = new Intl.NumberFormat("vi-VN");
export default function OrdersPage() {
  const { data, setData, loading, error } = useApiData(() => orderApi.mine(), [] as DeliveryOrder[]);
  const [busy, setBusy] = useState<number|null>(null); const [message, setMessage] = useState("");
  async function confirm(id:number) { setBusy(id); setMessage(""); try { await orderApi.confirmReceived(id); setData(await orderApi.mine()); } catch(e) { setMessage(e instanceof ApiError ? e.message : "KhÃ´ng thá»ƒ xÃ¡c nháº­n."); } finally { setBusy(null); } }
  return <CollectorShell><main className="mx-auto max-w-6xl px-5 py-10"><h1 className="text-3xl font-semibold">ÄÆ¡n hÃ ng cá»§a tÃ´i</h1>{message && <p className="mt-4 text-sm text-red-300">{message}</p>}<div className="mt-7 space-y-5">{data.map(o => <article key={o.orderId} className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs text-[var(--luxora-gold)]">ÄÆ¡n #{o.orderId}</p><h2 className="mt-1 font-semibold">{o.productName}</h2><p className="text-xs text-white/45">{o.addressLine}, {o.ward}, {o.district}, {o.province}</p></div><div className="text-right"><span className="rounded-full bg-white/10 px-3 py-1 text-xs">{o.status}</span><p className="mt-2 text-sm">{VND.format(o.finalPrice + o.shippingFee)} â‚«</p></div></div><ol className="mt-5 grid gap-2 md:grid-cols-3">{o.history.map((h,i) => <li key={`${h.createdAt}-${i}`} className="rounded-lg border border-white/10 p-3 text-xs"><b>{h.toStatus}</b><p className="mt-1 text-white/45">{new Date(h.createdAt).toLocaleString('vi-VN')}</p>{h.note && <p className="mt-1 text-white/60">{h.note}</p>}</li>)}</ol>{o.status === 'DELIVERED' && <button disabled={busy===o.orderId} onClick={() => void confirm(o.orderId)} className="gradient-cta mt-4 rounded-full px-4 py-2 text-xs font-semibold text-black disabled:opacity-50">{busy===o.orderId?'Äang xá»­ lÃ½...':'ÄÃ£ nháº­n hÃ ng'}</button>}</article>)}{!loading && !data.length && <p className="text-white/45">{error ?? 'ChÆ°a cÃ³ Ä‘Æ¡n hÃ ng.'}</p>}</div></main></CollectorShell>;
}
