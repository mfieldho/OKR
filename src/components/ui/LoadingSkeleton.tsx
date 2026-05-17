export function LoadingSkeleton() {
  return (
    <div className="p-8 space-y-6 animate-pulse">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-2xl" />
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="skeleton h-64 rounded-2xl col-span-2" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
      {/* OKR cards */}
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
