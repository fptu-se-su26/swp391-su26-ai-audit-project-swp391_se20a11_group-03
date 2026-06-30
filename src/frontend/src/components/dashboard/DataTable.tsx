import { ReactNode } from "react";

export default function DataTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white/86 shadow-[0_18px_55px_rgba(15,23,42,.075)] backdrop-blur">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left">
          <thead className="border-b border-[#e7dfcf] bg-gradient-to-r from-[#071626] to-[#10253a]">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-5 py-4 text-[9px] font-black uppercase tracking-[.16em] text-[#f0d98b]">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eee7dc] text-sm">{children}</tbody>
        </table>
      </div>
    </div>
  );
}
