import type { TaskPriority } from "../types/task";

const priorityClass: Record<TaskPriority, string> = {
  Low: "gray",
  Medium: "warn",
  High: "bad",
};

type PriorityBadgeProps = {
  priority: TaskPriority;
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return <span className={`tag ${priorityClass[priority]}`}>{priority}</span>;
}
