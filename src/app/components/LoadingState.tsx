import { Loader2 } from "lucide-react";

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="state-panel" role="status" aria-live="polite">
      <Loader2 className="spin" size={28} />
      <p className="muted">{message}</p>
    </div>
  );
}
