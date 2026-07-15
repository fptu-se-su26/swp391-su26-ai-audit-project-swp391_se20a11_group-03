import Link from "next/link";
import type { ReactNode } from "react";
import { displayFont } from "./theme";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** Dark luxe page wrapper. Scopes the theme to a single page. */
export function LuxePage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className={cn("min-h-screen bg-[#070706] text-[#f5ead9]", className)}>{children}</main>
  );
}

/** Small uppercase eyebrow label with a gold gradient underline. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d4aa61]">{children}</p>
      <span className="mt-3 block h-px w-40 bg-gradient-to-r from-[#d4aa61] to-transparent" />
    </div>
  );
}

/** Serif display heading. */
export function LuxeHeading({
  children,
  className,
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <Tag className={cn(displayFont, "font-medium leading-tight text-white", className)}>{children}</Tag>
  );
}

type ButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
};

const goldClasses =
  "inline-flex min-h-12 items-center justify-center gap-3 rounded bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] px-7 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[#100d08] shadow-[0_14px_40px_rgba(201,154,75,0.22)] transition hover:brightness-110";
const outlineClasses =
  "inline-flex min-h-12 items-center justify-center gap-3 rounded border border-[#d4aa61]/70 px-7 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[#f0ce88] transition hover:bg-[#d4aa61]/10";

/** Primary gold gradient button. */
export function GoldButton({ children, href, onClick, type = "button", className, disabled }: ButtonProps) {
  if (href) {
    return (
      <Link href={href} className={cn(goldClasses, className)}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cn(goldClasses, className)}>
      {children}
    </button>
  );
}

/** Secondary outline button. */
export function OutlineButton({ children, href, onClick, type = "button", className, disabled }: ButtonProps) {
  if (href) {
    return (
      <Link href={href} className={cn(outlineClasses, className)}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cn(outlineClasses, className)}>
      {children}
    </button>
  );
}

/** Dark bordered surface card. */
export function LuxeCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-md border border-white/10 bg-[#0e0d0b]", className)}>{children}</div>
  );
}
