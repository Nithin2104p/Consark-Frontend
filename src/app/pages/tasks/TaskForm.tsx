import type { FormEvent } from "react";
import {
  DEFAULT_TASK_PRIORITY,
  DEFAULT_TASK_STATUS,
  TASK_PRIORITIES,
  TASK_PRIORITY_I18N_KEY,
  TASK_STATUSES,
  TASK_STATUS_I18N_KEY,
  type TaskInput,
} from "../../types/task";
import { useTranslation } from "../../hooks/useTranslation";
import { ASSIGNEE_SELF } from "../../constants/task";
import { AssigneeSelect } from "./AssigneeSelect";

export type TaskFormState = TaskInput;

type TaskFormProps = {
  form: TaskFormState;
  errors: Record<string, string>;
  submitting?: boolean;
  submitLabel: string;
  onChange: (key: keyof TaskFormState, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
  showAssignee?: boolean;
  assignees?: { id: string; name: string }[];
  assigneeLoading?: boolean;
  assigneeHasMore?: boolean;
  onAssigneeLoadMore?: () => void;
  assigneeSearchQuery?: string;
  onAssigneeSearchChange?: (query: string) => void;
};

export function TaskForm({
  form,
  errors,
  submitting,
  submitLabel,
  onChange,
  onSubmit,
  onCancel,
  showAssignee,
  assignees = [],
  assigneeLoading = false,
  assigneeHasMore = false,
  onAssigneeLoadMore,
  assigneeSearchQuery = "",
  onAssigneeSearchChange,
}: TaskFormProps) {
  const { t } = useTranslation();

  return (
    <form className="task-form" onSubmit={onSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="title">{t("tasks.form.title")}</label>
        <input
          id="title"
          type="text"
          value={form.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder={t("tasks.form.titlePlaceholder")}
          aria-invalid={Boolean(errors.title)}
        />
        {errors.title && <span className="field-error">{errors.title}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="description">{t("tasks.form.description")}</label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder={t("tasks.form.descriptionPlaceholder")}
          rows={4}
          aria-invalid={Boolean(errors.description)}
        />
        {errors.description && <span className="field-error">{errors.description}</span>}
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="priority">{t("tasks.form.priority")}</label>
          <select
            id="priority"
            value={form.priority}
            onChange={(e) => onChange("priority", e.target.value)}
            aria-invalid={Boolean(errors.priority)}
          >
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {t(`task.priority.${TASK_PRIORITY_I18N_KEY[priority]}`)}
              </option>
            ))}
          </select>
          {errors.priority && <span className="field-error">{errors.priority}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="status">{t("tasks.form.status")}</label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => onChange("status", e.target.value)}
            aria-invalid={Boolean(errors.status)}
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`task.status.${TASK_STATUS_I18N_KEY[status]}`)}
              </option>
            ))}
          </select>
          {errors.status && <span className="field-error">{errors.status}</span>}
        </div>
      </div>

      {showAssignee && (
        <div className="form-field">
          <label htmlFor="assignedTo">{t("tasks.form.assignee")}</label>
          <AssigneeSelect
            value={form.assignedTo ?? ""}
            onChange={(v) => onChange("assignedTo", v)}
            users={assignees}
            loading={assigneeLoading}
            hasMore={assigneeHasMore}
            onLoadMore={onAssigneeLoadMore ?? (() => {})}
            searchQuery={assigneeSearchQuery}
            onSearchChange={onAssigneeSearchChange ?? (() => {})}
          />
          {errors.assignedTo && <span className="field-error">{errors.assignedTo}</span>}
        </div>
      )}

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
            {t("common.cancel")}
          </button>
        )}
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? t("common.saving") : submitLabel}
        </button>
      </div>
    </form>
  );
}

export const defaultTaskForm: TaskFormState = {
  title: "",
  description: "",
  priority: DEFAULT_TASK_PRIORITY,
  status: DEFAULT_TASK_STATUS,
  assignedTo: ASSIGNEE_SELF,
};
