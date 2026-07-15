import Header from "@/components/home/Header";
import Hero from "@/components/home/Hero";
import HomeDynamicSections from "@/components/home/HomeDynamicSections";
import ProcessAndBrandsSection from "@/components/home/ProcessAndBrandsSection";
import HomeCtaSection from "@/components/home/HomeCtaSection";
import Footer from "@/components/home/Footer";
import { DEFAULT_PUBLIC_STATS } from "@/lib/home-data";

export default function Home() {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/images/luxury-watch-hero-mobile.webp"
        type="image/webp"
        media="(max-width: 1023px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/images/luxury-watch-hero-lcp.webp"
        type="image/webp"
        media="(min-width: 1024px)"
        fetchPriority="high"
      />
      <div className="flex min-h-screen flex-col bg-black text-white">
        <Header />
        <main className="flex-1">
          <Hero stats={DEFAULT_PUBLIC_STATS} />
          <HomeDynamicSections />
          <ProcessAndBrandsSection />
          <HomeCtaSection />
        </main>
        <Footer />
      </div>
    </>
  );
}
