const benefits = [
  ["workspace_premium", "Xác thực bởi chuyên gia", "Mỗi sản phẩm được kiểm định độc lập."],
  ["shield_lock", "Thanh toán bảo mật", "Tiền được bảo vệ trong suốt giao dịch."],
  ["public", "Nhà sưu tầm toàn cầu", "Tiếp cận người mua nghiêm túc tại 42 quốc gia."],
];

export default function SellerBenefits() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {benefits.map(([icon, title, description]) => <div key={title} className="rounded-2xl border border-[#e1dbcf] bg-white/75 p-4 shadow-[0_8px_25px_rgba(18,31,44,.04)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[#c7a85b]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f2ead7] text-[#927026]"><span className="material-symbols-outlined text-[19px]">{icon}</span></span><h3 className="mt-3 text-xs font-bold text-[#102235]">{title}</h3><p className="mt-1 text-[11px] leading-5 text-[#737c84]">{description}</p></div>)}
    </div>
  );
}
