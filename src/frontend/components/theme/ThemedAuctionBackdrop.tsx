import Image from "next/image";

type ThemedAuctionBackdropProps = {
  priority?: boolean;
  sizes?: string;
  className?: string;
};

export default function ThemedAuctionBackdrop({
  priority = false,
  sizes = "100vw",
  className = "object-cover object-[72%_center]",
}: ThemedAuctionBackdropProps) {
  return (
    <>
      <Image
        src="/images/hero-auction-light-v2.webp"
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        className={`themed-auction-backdrop themed-auction-backdrop--light ${className}`}
      />
      <Image
        src="/images/hero-auction-dark-v2.webp"
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        className={`themed-auction-backdrop themed-auction-backdrop--dark ${className}`}
      />
    </>
  );
}
