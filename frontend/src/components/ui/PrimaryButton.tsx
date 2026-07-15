import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  children: ReactNode;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-slate-950 text-white shadow-[0_14px_30px_rgba(15,23,42,.18)] hover:-translate-y-0.5 hover:bg-[#9a6b13] hover:shadow-[0_18px_40px_rgba(154,107,19,.24)]",
  secondary:
    "border border-slate-200 bg-white text-slate-900 shadow-sm hover:-translate-y-0.5 hover:border-[#d6a84f]/50 hover:bg-[#fff8e6] hover:text-[#8a5d0f]",
  ghost:
    "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
  danger:
    "bg-red-600 text-white shadow-[0_14px_30px_rgba(220,38,38,.16)] hover:-translate-y-0.5 hover:bg-red-700",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-3.5 text-sm",
};

export default function PrimaryButton({
  href,
  children,
  iconLeft,
  iconRight,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: Props) {
  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 disabled:pointer-events-none disabled:opacity-60",
    variants[variant],
    sizes[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {iconLeft}
      <span>{children}</span>
      {iconRight}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {content}
    </button>
  );
}
