import { WHY_CHOOSE_FEATURES } from "@/lib/home-data";

const FEATURE_META = ["Đã xác minh", "Thời gian thực", "Ký quỹ", "24/7"];

export default function WhyChooseSection() {
  return (
    <div>
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/35">
          Nền tảng tin cậy
        </p>
        <h2 className="mt-2 text-sm font-semibold tracking-[0.25em] text-[#f0c982]">
          VÌ SAO CHỌN LUXURY AUCTION?
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {WHY_CHOOSE_FEATURES.map((feature, index) => (
          <div
            key={feature.id}
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#070707] p-5 transition-all duration-300 hover:border-[#f0c982]/55 hover:bg-white/[0.045]"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f0c982]/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#d7aa63]/40 bg-[#f0c982]/10">
                <span className="material-symbols-outlined text-2xl text-[#f0c982]">
                  {feature.icon}
                </span>
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold tracking-wider text-white">
                    {feature.title}
                  </h3>
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/40">
                    {FEATURE_META[index]}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-white/56">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
