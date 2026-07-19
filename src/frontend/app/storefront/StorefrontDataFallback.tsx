export default function StorefrontDataFallback() {
  return (
    <div
      className="mt-8 grid min-h-[700px] grid-cols-1 gap-8 lg:grid-cols-[300px_minmax(0,1fr)]"
      aria-label="Đang tải sản phẩm"
    >
      <div className="h-72 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
      <div className="h-80 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
    </div>
  );
}
