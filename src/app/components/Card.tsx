import type { ReactNode } from "react";

type CardProps = {
  title: string;
  actionLabel?: string;
  children: ReactNode;
};

export function Card({ title, actionLabel, children }: CardProps) {
  return (
    <div className="card">
      <div className="card-head">
        <h3>{title}</h3>
        {actionLabel && (
          <button type="button" className="link">
            {actionLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
