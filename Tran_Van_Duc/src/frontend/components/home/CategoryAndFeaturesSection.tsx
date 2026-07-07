import CategorySection from "@/components/home/CategorySection";
import WhyChooseSection from "@/components/home/WhyChooseSection";

export default function CategoryAndFeaturesSection() {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_35%,rgba(240,201,130,0.035))]" />
      <div className="relative mx-auto max-w-[1600px] px-4 py-12 sm:px-6 sm:py-16 lg:px-12">
        <CategorySection />
        <div className="mt-12 sm:mt-16">
          <WhyChooseSection />
        </div>
      </div>
    </section>
  );
}
