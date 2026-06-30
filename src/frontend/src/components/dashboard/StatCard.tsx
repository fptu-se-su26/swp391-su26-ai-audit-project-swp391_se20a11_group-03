type Props = {
  icon: string;
  label: string;
  value: string | number;
  detail?: string;
  tone?: "navy" | "gold" | "green" | "red";
};

const tones: Record<NonNullable<Props["tone"]>, { icon: string; glow: string; accent: string }> = {
  navy: {
    icon: "bg-[#e7edf4] text-[#18374e]",
    glow: "bg-[#1d4ed8]/10",
    accent: "from-[#18374e] to-[#2f6d9c]",
  },
  gold: {
    icon: "bg-[#f3ead3] text-[#9a6b13]",
    glow: "bg-[#d2ad55]/18",
    accent: "from-[#b8860b] to-[#f0d98b]",
  },
  green: {
    icon: "bg-[#e1f0ea] text-[#2d6e5b]",
    glow: "bg-[#2d6e5b]/10",
    accent: "from-[#2d6e5b] to-[#89d8bd]",
  },
  red: {
    icon: "bg-[#f6e5e2] text-[#a23d37]",
    glow: "bg-[#a23d37]/10",
    accent: "from-[#a23d37] to-[#e98f85]",
  },
};

export default function StatCard({ icon, label, value, detail, tone = "navy" }: Props) {
  const style = tones[tone];

  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-white/70 bg-white/82 p-5 shadow-[0_16px_45px_rgba(15,23,42,.075)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#d2ad55]/45 hover:shadow-[0_24px_60px_rgba(15,23,42,.12)]">
      <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full ${style.glow} blur-2xl transition group-hover:scale-125`} />
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${style.accent}`} />
      <div className="relative flex items-start justify-between">
        <span className={`grid h-11 w-11 place-items-center rounded-2xl ${style.icon} shadow-inner shadow-white/60`}>
          <span className="material-symbols-outlined text-[21px]">{icon}</span>
        </span>
        {detail && <span className="rounded-full bg-[#06111f]/5 px-2.5 py-1 text-[10px] font-bold text-[#516173]">{detail}</span>}
      </div>
      <p className="relative mt-6 text-[10px] font-black uppercase tracking-[.14em] text-[#7b8490]">{label}</p>
      <p className="relative mt-1 font-display-lg text-3xl font-black tracking-[-.05em] text-[#071626]">{value}</p>
    </div>
  );
}
