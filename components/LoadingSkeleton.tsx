export function LoadingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="glass-card h-36 animate-pulse p-5">
          <div className="h-4 w-24 rounded bg-white/10" />
          <div className="mt-6 h-8 w-32 rounded bg-white/10" />
          <div className="mt-5 h-4 w-40 rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}
