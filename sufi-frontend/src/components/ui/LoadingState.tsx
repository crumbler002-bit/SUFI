export default function LoadingState({ count = 3 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="glass-panel p-5 animate-pulse">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="h-5 w-32 bg-white/10 rounded mb-2" />
              <div className="h-3 w-20 bg-white/5 rounded" />
            </div>
            <div className="h-4 w-8 bg-white/5 rounded" />
          </div>
          <div className="flex gap-1.5 mb-3">
            <div className="h-4 w-14 bg-white/5 rounded-full" />
            <div className="h-4 w-10 bg-white/5 rounded-full" />
          </div>
          <div className="flex gap-1 mb-3">
            {[...Array(5)].map((_, j) => (
              <div key={j} className="h-1 w-6 bg-white/5 rounded-full" />
            ))}
          </div>
          <div className="h-3 w-full bg-white/5 rounded" />
        </div>
      ))}
    </div>
  );
}
