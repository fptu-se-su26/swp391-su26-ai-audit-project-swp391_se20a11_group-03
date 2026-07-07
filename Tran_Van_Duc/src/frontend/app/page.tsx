import Header from "@/components/home/Header";
import Hero from "@/components/home/Hero";
import LiveAuctionSection from "@/components/home/LiveAuctionSection";
import PublicProductSection from "@/components/home/PublicProductSection";
import ProcessAndBrandsSection from "@/components/home/ProcessAndBrandsSection";
import HomeCtaSection from "@/components/home/HomeCtaSection";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Header />
      <main className="flex-1">
        <Hero />
        <LiveAuctionSection />
        <PublicProductSection />
        <ProcessAndBrandsSection />
        <HomeCtaSection />
      </main>
      <Footer />
    </div>
  );
}
