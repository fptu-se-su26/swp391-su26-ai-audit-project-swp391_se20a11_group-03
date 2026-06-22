import { ReactNode } from "react";
export default function DataTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return <div className="overflow-hidden rounded-2xl border border-[#e0d9ce] bg-white/85 shadow-[0_8px_30px_rgba(18,31,44,.04)]"><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead className="border-b border-[#e7e1d7] bg-[#f6f2e9]"><tr>{headers.map((header) => <th key={header} className="px-5 py-3 text-[9px] font-bold uppercase tracking-[.13em] text-[#707981]">{header}</th>)}</tr></thead><tbody className="divide-y divide-[#eee9e0] text-sm">{children}</tbody></table></div></div>;
}
