import Link from "next/link";

type Props = {
  href?: string;
  compact?: boolean;
  inverted?: boolean;
  className?: string;
};

export const BRAND_NAME = "BidZone";

export default function BrandLogo({ href = "/", compact = false, inverted = false, className = "" }: Props) {
  const content = (
    <span className={`group inline-flex items-center gap-3 ${className}`}>
      <span
        className={`${compact ? "h-10 w-10" : "h-12 w-12"} shrink-0 transition-transform duration-300 drop-shadow-[0_12px_24px_rgba(20,52,142,.22)] group-hover:-rotate-3 group-hover:scale-105`}
      >
        <img src="/bidzone-logo.png" alt="" className="h-full w-full object-contain" />
      </span>
      {!compact && (
        <span className="font-display-lg text-[23px] font-black tracking-[-0.055em]">
          <span className={inverted ? "text-white" : "text-blue-900"}>Bid</span>
          <span className={inverted ? "text-[#d5b15d]" : "text-[#9a6b13]"}>Zone</span>
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label={`${BRAND_NAME} home`}>
      {content}
    </Link>
  );
}
