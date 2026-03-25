interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <span className="text-2xl">⚠</span>
      </div>
      <h3 className="text-lg font-medium text-white/70 mb-2">Something went wrong</h3>
      <p className="text-sm text-white/40 max-w-sm mb-4">
        {message || "We couldn't connect to the intelligence engine. Please try again."}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm px-6 py-2">
          Retry
        </button>
      )}
    </div>
  );
}
