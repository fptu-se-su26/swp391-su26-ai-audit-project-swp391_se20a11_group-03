export default function LoadingSkeleton({ cards = 4 }: { cards?: number }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: cards }).map((_, i) => <div key={i} className="h-44 animate-pulse rounded-2xl border border-[#e5dfd4] bg-gradient-to-br from-white to-[#eee9df]" />)}</div>;
}
