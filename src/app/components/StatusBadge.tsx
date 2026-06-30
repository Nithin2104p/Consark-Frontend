import type { TaskStatus } from "../types/task";

const statusClass: Record<TaskStatus, string> = {
  Open: "info",
  "In-Progress": "warn",
  Completed: "ok",
};

type StatusBadgeProps = {
  status: TaskStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`tag ${statusClass[status]}`}>{status}</span>;
}
