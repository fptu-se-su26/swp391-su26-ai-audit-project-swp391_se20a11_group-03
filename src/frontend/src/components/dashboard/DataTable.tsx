import { ReactNode } from "react";

export default function DataTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0e0d0b] shadow-[0_18px_55px_rgba(0,0,0,.4)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left">
          <thead className="border-b border-white/10 bg-gradient-to-r from-[#12100b] to-[#1b1813]">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-5 py-4 text-[9px] font-black uppercase tracking-[.16em] text-[#f0d98b]">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[.06] text-sm">{children}</tbody>
        </table>
      </div>
    </div>
  );
}
