import { ReactNode } from "react";
export default function MessagePanel({ conversations, children }: { conversations: ReactNode; children: ReactNode }) {
  return <div className="grid h-[calc(100vh-8rem)] min-h-[560px] overflow-hidden rounded-3xl border border-[#ddd6c9] bg-white/85 shadow-[0_18px_50px_rgba(18,31,44,.08)] lg:grid-cols-[330px_1fr]"><aside className="border-b border-[#e6e0d5] bg-[#f8f5ee] lg:border-b-0 lg:border-r">{conversations}</aside><section className="min-w-0 bg-[#fffdf9]">{children}</section></div>;
}
