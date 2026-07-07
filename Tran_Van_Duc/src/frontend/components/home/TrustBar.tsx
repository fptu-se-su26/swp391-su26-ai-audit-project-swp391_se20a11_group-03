import { BRAND_ITEMS } from "@/lib/home-data";

export default function TrustBar() {
  return (
    <section className="border-b border-white/10">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-10 gap-y-4 px-6 py-8 lg:px-12">
        {BRAND_ITEMS.map((brand) => (
          <span
            key={brand.id}
            className="text-sm font-semibold tracking-widest text-white/35"
          >
            {brand.name}
          </span>
        ))}
      </div>
    </section>
  );
}
