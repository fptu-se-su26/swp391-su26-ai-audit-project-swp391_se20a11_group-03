import Header from "@/components/home/Header";
import Hero from "@/components/home/Hero";
import HomeDynamicSections from "@/components/home/HomeDynamicSections";
import ProcessAndBrandsSection from "@/components/home/ProcessAndBrandsSection";
import HomeDiscoverySections from "@/components/home/HomeDiscoverySections";
import HomeCtaSection from "@/components/home/HomeCtaSection";
import Footer from "@/components/home/Footer";
import { DEFAULT_PUBLIC_STATS } from "@/lib/home-data";

export default function Home() {
  return (
    <>
      <div className="luxora-app flex min-h-screen flex-col bg-black text-white">
        <Header />
        <main className="flex-1">
          <Hero stats={DEFAULT_PUBLIC_STATS} />
          <HomeDynamicSections />
          <ProcessAndBrandsSection />
          <HomeDiscoverySections />
          <HomeCtaSection />
        </main>
        <Footer />
      </div>
    </>
  );
}
