"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/home/Header";
import HeroSection from "@/components/home/HeroSection";
import StatsStrip from "@/components/home/StatsStrip";
import LiveAuctionGrid from "@/components/home/LiveAuctionGrid";
import MarketSections from "@/components/home/MarketSections";
import SellCTA from "@/components/home/SellCTA";
import Footer from "@/components/home/Footer";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { sampleLots } from "@/components/home/sampleLots";
import { LuxuryLot } from "@/components/home/types";
import { toLuxuryLot } from "@/lib/luxuryLotMapper";
import { searchProducts } from "@/lib/services/productService";

function fallbackByStatus(status: LuxuryLot["status"]) {
  return sampleLots.map((lot, index) => ({
    ...lot,
    id: status === "live" ? lot.id : lot.id + (status === "upcoming" ? 100 : 200),
    lotNumber: String(Number(lot.lotNumber) + (status === "upcoming" ? 100 : status === "ended" ? 200 : 0)).padStart(3, "0"),
    status,
    timeLeft: status === "upcoming" ? `${index + 1}d ${index + 2}h` : status === "ended" ? "Sold" : lot.timeLeft,
    currentBid: status === "ended" ? Math.round(lot.currentBid * 1.18) : lot.currentBid,
  }));
}

export default function BrowsePage() {
  return <Suspense fallback={<div className="min-h-screen luxe-page" />}><BrowseContent /></Suspense>;
}

function BrowseContent() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const [liveLots, setLiveLots] = useState<LuxuryLot[]>(fallbackByStatus("live"));
  const [upcomingLots, setUpcomingLots] = useState<LuxuryLot[]>(fallbackByStatus("upcoming"));
  const [resultLots, setResultLots] = useState<LuxuryLot[]>(fallbackByStatus("ended"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.allSettled([
      searchProducts({ keyword, status: "APPROVED", auctionStatus: "ACTIVE", size: 8 }),
      searchProducts({ keyword, status: "APPROVED", auctionStatus: "UPCOMING", size: 6 }),
      searchProducts({ keyword, status: "APPROVED", auctionStatus: "ENDED", size: 6 }),
    ]).then(([live, upcoming, ended]) => {
      if (!active) return;
      if (live.status === "fulfilled" && live.value.content.length) setLiveLots(live.value.content.map((item, i) => toLuxuryLot(item, i, "live")));
      if (upcoming.status === "fulfilled" && upcoming.value.content.length) setUpcomingLots(upcoming.value.content.map((item, i) => toLuxuryLot(item, i, "upcoming")));
      if (ended.status === "fulfilled" && ended.value.content.length) setResultLots(ended.value.content.map((item, i) => toLuxuryLot(item, i, "ended")));
      setLoading(false);
    });
    return () => { active = false; };
  }, [keyword]);

  const featured = useMemo(() => liveLots[0] || sampleLots[0], [liveLots]);

  return (
    <main className="min-h-screen overflow-x-clip luxe-page">
      <Header />
      <HeroSection featuredLot={featured} />
      <ScrollReveal>
        <StatsStrip />
      </ScrollReveal>
      <ScrollReveal>
        <LiveAuctionGrid lots={liveLots} loading={loading && liveLots.length === 0} />
      </ScrollReveal>
      <ScrollReveal>
        <MarketSections upcoming={upcomingLots} results={resultLots} />
      </ScrollReveal>
      <ScrollReveal>
        <SellCTA />
      </ScrollReveal>
      <ScrollReveal>
        <Footer />
      </ScrollReveal>
    </main>
  );
}
