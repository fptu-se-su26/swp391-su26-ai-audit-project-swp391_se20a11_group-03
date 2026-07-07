import Image from "next/image";

type BidZoneLogoProps = {
  className?: string;
  priority?: boolean;
};

export default function BidZoneLogo({
  className = "h-10 w-auto",
  priority = false,
}: BidZoneLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative aspect-square h-full shrink-0">
        <Image
          src="/bidzone-logo.png"
          alt=""
          fill
          sizes="64px"
          priority={priority}
          className="object-contain"
        />
      </span>
      <span className="text-[1.35rem] font-black leading-none tracking-[-0.055em]">
        <span className="text-white">Bid</span>
        <span className="text-[#d5b15d]">Zone</span>
      </span>
    </span>
  );
}
