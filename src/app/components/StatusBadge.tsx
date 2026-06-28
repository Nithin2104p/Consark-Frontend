import type { Goalstatus } from "../types/task";

const statusClass: Record<Goalstatus, string> = {
  Open: "info",
  "In Progress": "warn",
  Completed: "ok",
};

type StatusBadgeProps = {
  status: Goalstatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`tag ${statusClass[status]}`}>{status}</span>;
}
