import { ReactNode } from "react";
export default function SettingsForm({ icon, title, description, children }: { icon: string; title: string; description?: string; children: ReactNode }) {
  return <section className="rounded-2xl border border-[#e0d9ce] bg-white/80 p-5 shadow-[0_8px_28px_rgba(18,31,44,.04)] sm:p-6"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f1ead9] text-[#947025]"><span className="material-symbols-outlined text-[20px]">{icon}</span></span><div><h2 className="font-display-lg text-lg font-semibold text-[#071626]">{title}</h2>{description && <p className="mt-1 text-xs leading-5 text-[#737d85]">{description}</p>}</div></div><div className="mt-6">{children}</div></section>;
}
