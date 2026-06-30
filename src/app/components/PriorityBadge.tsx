import { useTranslation } from "../hooks/useTranslation";
import { PRIORITY_BADGE_CLASS } from "../constants/ui";
import { TASK_PRIORITY_I18N_KEY, type TaskPriority } from "../types/task";

type PriorityBadgeProps = {
  priority: TaskPriority;
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const { t } = useTranslation();
  return (
    <span className={`tag ${PRIORITY_BADGE_CLASS[priority]}`}>
      {t(`task.priority.${TASK_PRIORITY_I18N_KEY[priority]}`)}
    </span>
  );
}
