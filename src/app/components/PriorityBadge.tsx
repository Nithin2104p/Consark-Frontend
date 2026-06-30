import { useTranslation } from "../hooks/useTranslation";
import { TASK_PRIORITY_I18N_KEY, type TaskPriority } from "../types/task";

const priorityClass: Record<TaskPriority, string> = {
  Low: "gray",
  Medium: "warn",
  High: "bad",
};

type PriorityBadgeProps = {
  priority: TaskPriority;
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const { t } = useTranslation();
  return (
    <span className={`tag ${priorityClass[priority]}`}>
      {t(`task.priority.${TASK_PRIORITY_I18N_KEY[priority]}`)}
    </span>
  );
}
