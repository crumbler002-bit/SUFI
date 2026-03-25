export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <span className="text-2xl opacity-40">🔍</span>
      </div>
      <h3 className="text-lg font-medium text-white/60 mb-2">No results yet</h3>
      <p className="text-sm text-white/30 max-w-sm">
        Try searching for something like &ldquo;romantic dinner with wine&rdquo; or &ldquo;rooftop sushi near me&rdquo;
      </p>
    </div>
  );
}
