import Link from "next/link";
import WatchlistButton from "@/components/features/WatchlistButton";
import { getProductImage } from "@/lib/productPresentation";
import { ProductSummary } from "@/lib/services/productService";
import { useTranslations } from "@/i18n/I18nProvider";

const numberFormatter = new Intl.NumberFormat("vi-VN");

export function formatTimeRemaining(endTime?: string | null, t?: (key: string) => string) {
  if (!endTime) {
    return t ? t("liveLotCard.tbd") : "TBD";
  }

  const diffMs = new Date(endTime).getTime() - Date.now();
  if (diffMs <= 0) {
    return t ? t("liveLotCard.ended") : "Ended";
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function LiveLotCard({ product }: { product: ProductSummary }) {
  const t = useTranslations("liveLotCard");
  const isLive = product.auctionStatus === "ACTIVE";

  return (
    <Link
      href={`/auctions/${product.productId}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-surface-variant bg-surface soft-shadow transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-52 overflow-hidden bg-surface-variant">
        <img
          src={getProductImage(product.imageUrl)}
          alt={product.productName}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <WatchlistButton productId={product.productId} />
        {isLive && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-surface/90 px-3 py-1 backdrop-blur-sm">
            <span className="pulse-live h-2 w-2 rounded-full bg-error" />
            <span className="font-label-sm text-[10px] font-bold uppercase tracking-wide text-on-surface">{t("live")}</span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 rounded bg-surface/90 px-2 py-1 backdrop-blur-sm">
          <span className="font-label-sm text-label-sm text-on-surface">Lot #{product.productId}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-md">
        <p className="mb-xs text-sm text-on-surface-variant">{product.categoryName ?? t("uncategorized")}</p>
        <h3 className="mb-auto font-headline-sm text-headline-sm text-primary">{product.productName}</h3>
        <div className="mt-md flex items-end justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {isLive ? t("currentBid") : t("startingBid")}
            </p>
            <p className="font-headline-sm text-headline-sm font-bold text-primary">
              {numberFormatter.format(product.currentBid || product.startingPrice)} VND
            </p>
          </div>
          <div className="text-right">
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {isLive ? t("endsIn") : t("starts")}
            </p>
            <p className={`font-label-md text-label-md font-bold ${isLive ? "text-error" : "text-on-surface"}`}>
              {isLive ? formatTimeRemaining(product.auctionEndTime) : (product.auctionStartTime ? new Date(product.auctionStartTime).toLocaleDateString("vi-VN") : t("liveLotCard.tbd"))}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
