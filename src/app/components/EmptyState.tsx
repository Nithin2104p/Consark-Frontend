import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="state-panel">
      <Inbox size={28} />
      <h3>{title}</h3>
      {description && <p className="muted">{description}</p>}
      {actionLabel && onAction && (
        <button type="button" className="btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
