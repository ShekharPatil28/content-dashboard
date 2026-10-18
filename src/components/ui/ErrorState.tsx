import { AlertTriangle } from "lucide-react";

interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-6 py-12 text-center"
    >
      <AlertTriangle size={32} className="text-red-500" aria-hidden="true" />
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="max-w-md text-sm text-muted">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Try again
        </button>
      )}
    </div>
  );
}