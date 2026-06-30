import { useTranslation } from "../hooks/useTranslation";
import { TASK_STATUS_I18N_KEY, type TaskStatus } from "../types/task";

const statusClass: Record<TaskStatus, string> = {
  Open: "info",
  "In-Progress": "warn",
  Completed: "ok",
};

type StatusBadgeProps = {
  status: TaskStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  return (
    <span className={`tag ${statusClass[status]}`}>
      {t(`task.status.${TASK_STATUS_I18N_KEY[status]}`)}
    </span>
  );
}
