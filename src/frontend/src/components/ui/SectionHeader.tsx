import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
};

export default function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  tone = "light",
}: Props) {
  const centered = align === "center";
  const dark = tone === "dark";

  return (
    <div className={`flex flex-col gap-5 ${centered ? "items-center text-center" : "lg:flex-row lg:items-end lg:justify-between"}`}>
      <div className={centered ? "mx-auto max-w-2xl" : "max-w-2xl"}>
        {eyebrow && (
          <p className={`mb-3 text-[11px] font-extrabold uppercase tracking-[.22em] ${dark ? "text-[#d8bd75]" : "text-[#9a6b13]"}`}>
            {eyebrow}
          </p>
        )}
        <h2 className={`font-display-lg text-3xl font-black tracking-[-.05em] sm:text-4xl ${dark ? "text-white" : "text-slate-950"}`}>
          {title}
        </h2>
        {description && (
          <p className={`mt-3 text-sm leading-6 sm:text-base ${dark ? "text-slate-300" : "text-slate-600"}`}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
