import { useTranslation } from "../hooks/useTranslation";
import { STATUS_BADGE_CLASS } from "../constants/ui";
import { TASK_STATUS_I18N_KEY, type TaskStatus } from "../types/task";

type StatusBadgeProps = {
  status: TaskStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  return (
    <span className={`tag ${STATUS_BADGE_CLASS[status]}`}>
      {t(`task.status.${TASK_STATUS_I18N_KEY[status]}`)}
    </span>
  );
}
