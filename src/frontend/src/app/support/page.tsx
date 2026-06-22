"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

const faqs = [
  ["gavel", "Đặt giá & phiên đấu giá", "Cách đặt bid, bước giá và quy tắc gia hạn."],
  ["verified", "Xác thực sản phẩm", "Quy trình thẩm định và bảo chứng của chuyên gia."],
  ["payments", "Thanh toán & hoàn tiền", "Nạp tiền, thanh toán lot thắng và hoàn cọc."],
  ["local_shipping", "Vận chuyển & bảo hiểm", "Theo dõi giao hàng luxury được bảo hiểm."],
  ["storefront", "Bán cùng LuxeAuction", "Đăng ký seller, định giá và phí dịch vụ."],
  ["security", "Tài khoản & bảo mật", "2FA, xác minh danh tính và bảo vệ tài khoản."],
];

export default function SupportPage() {
  const [query, setQuery] = useState("");
  return <DashboardLayout><div className="mx-auto max-w-[1260px] px-4 py-10 sm:px-7 lg:px-10 lg:py-14"><DashboardHeader eyebrow="Private client care" title="Trung tâm hỗ trợ" subtitle="Nhận câu trả lời nhanh hoặc kết nối với Auction Concierge của LuxeAuction."/>
    <div className="mt-8 rounded-3xl border border-white/10 bg-[#071626] p-7 text-white shadow-[0_22px_60px_rgba(7,22,38,.18)] sm:p-10"><p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#d9bc72]">How can we help?</p><h2 className="mt-3 font-display-lg text-2xl font-semibold sm:text-3xl">Bạn cần hỗ trợ vấn đề gì?</h2><div className="mt-6 flex max-w-2xl items-center rounded-2xl border border-white/15 bg-white/[.07] px-4 py-3 focus-within:border-[#d7b86b]"><span className="material-symbols-outlined text-[#d7b86b]">search</span><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Tìm kiếm câu hỏi, thanh toán, vận chuyển…" className="ml-3 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#80909d]"/></div></div>
    <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{faqs.filter(([,title])=>title.toLowerCase().includes(query.toLowerCase())).map(([icon,title,desc])=><button key={title} className="group rounded-2xl border border-[#e0d9ce] bg-white/80 p-5 text-left shadow-[0_8px_28px_rgba(18,31,44,.04)] transition hover:-translate-y-1 hover:border-[#c5a65b]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f1ead9] text-[#947025]"><span className="material-symbols-outlined text-[20px]">{icon}</span></span><h3 className="mt-4 text-sm font-bold text-[#102235]">{title}</h3><p className="mt-2 text-xs leading-5 text-[#737d85]">{desc}</p><span className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#8c681f]">Xem hướng dẫn <span className="material-symbols-outlined text-[15px]">arrow_forward</span></span></button>)}</div>
    <div className="mt-7 grid gap-4 lg:grid-cols-2"><div className="rounded-2xl border border-[#dfd8cb] bg-white/75 p-6"><span className="material-symbols-outlined text-[#9a7429]">support_agent</span><h3 className="mt-3 font-display-lg text-lg font-semibold">Auction Concierge</h3><p className="mt-2 text-xs leading-5 text-[#737d85]">Chat trực tiếp với chuyên viên hỗ trợ. Thời gian phản hồi trung bình dưới 2 phút.</p><button className="mt-5 rounded-full bg-[#071626] px-5 py-2.5 text-xs font-bold text-[#e4c77b]">Bắt đầu trò chuyện</button></div><div className="rounded-2xl border border-[#dfd8cb] bg-[#f1ead9] p-6"><span className="material-symbols-outlined text-[#9a7429]">mail</span><h3 className="mt-3 font-display-lg text-lg font-semibold">Gửi yêu cầu riêng</h3><p className="mt-2 text-xs leading-5 text-[#737d85]">Dành cho định giá, vận chuyển quốc tế hoặc giao dịch giá trị cao.</p><button className="mt-5 rounded-full border border-[#9e7a31] px-5 py-2.5 text-xs font-bold text-[#795b20]">Liên hệ chuyên gia</button></div></div>
  </div></DashboardLayout>;
}
