interface ErrorCardProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorCard({ title, message, onRetry }: ErrorCardProps) {
  return (
    <div className="bg-surface border border-accent-red/30 rounded-xl p-5">
      <p className="text-accent-red font-medium text-sm">{title}</p>
      <p className="text-text-secondary text-sm mt-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 px-4 py-1.5 rounded-md text-sm font-medium bg-surface-elevated text-white hover:bg-white/10 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
