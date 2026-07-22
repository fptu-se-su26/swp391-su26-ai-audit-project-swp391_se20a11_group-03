export type LiveAuctionItem = {
  id: string;
  status: "ACTIVE" | "UPCOMING";
  title: string;
  subtitle: string;
  currentPrice: string;
  estimatedPrice: string;
  bidCount: number;
  startsAt: number;
  endsAt: number;
  imageSrc: string;
};



export type FeatureItem = {
  id: string;
  icon: string;
};

export type TrustStat = {
  id: string;
  value: string;
};

export const DEFAULT_PUBLIC_STATS: TrustStat[] = [
  { id: "products", value: "500+" },
  { id: "members", value: "2K+" },
  { id: "active-auctions", value: "24/7" },
  { id: "completed-auctions", value: "1K+" },
];

export type AuctionProcessStep = {
  id: string;
  icon: string;
};

export type BrandItem = {
  id: string;
  name: string;
  mark: string;
};

export const NAV_LINKS = [
  { key: "home", href: "/" },
  { key: "products", href: "/storefront" },
  { key: "brands", href: "/brands" },
  { key: "about", href: "/about" },
  { key: "events", href: "/events" },
];





export const WHY_CHOOSE_FEATURES: FeatureItem[] = [
  {
    id: "verified-sellers",
    icon: "verified_user",
  },
  {
    id: "transparent",
    icon: "workspace_premium",
  },
  {
    id: "secure-payment",
    icon: "encrypted",
  },
  {
    id: "support",
    icon: "diamond",
  },
];

export const AUCTION_PROCESS_STEPS: AuctionProcessStep[] = [
  {
    id: "verify",
    icon: "person_check",
  },
  {
    id: "deposit",
    icon: "inventory_2",
  },
  {
    id: "bid",
    icon: "computer",
  },
  {
    id: "payment",
    icon: "local_shipping",
  },
];

export const BRAND_ITEMS: BrandItem[] = [
  { id: "rolex", name: "ROLEX", mark: "ROLEX" },
  { id: "apple", name: "APPLE", mark: "APPLE" },
  { id: "patek", name: "PATEK PHILIPPE", mark: "PATEK" },
  { id: "louis-vuitton", name: "LOUIS VUITTON", mark: "LV" },
  { id: "leica", name: "LEICA", mark: "LEICA" },
  { id: "sony", name: "SONY", mark: "SONY" },
  { id: "dji", name: "DJI", mark: "DJI" },
  { id: "bose", name: "BOSE", mark: "BOSE" },
];
