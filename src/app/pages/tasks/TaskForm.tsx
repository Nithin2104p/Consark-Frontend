import type { FormEvent } from "react";
import { TASK_PRIORITIES, TASK_STATUSES, type TaskInput } from "../../types/task";

export type TaskFormState = TaskInput;

type TaskFormProps = {
  form: TaskFormState;
  errors: Record<string, string>;
  submitting?: boolean;
  submitLabel: string;
  onChange: (key: keyof TaskFormState, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
};

export function TaskForm({
  form,
  errors,
  submitting,
  submitLabel,
  onChange,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  return (
    <form className="task-form" onSubmit={onSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={form.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="Enter task title"
          aria-invalid={Boolean(errors.title)}
        />
        {errors.title && <span className="field-error">{errors.title}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Enter task description"
          rows={4}
          aria-invalid={Boolean(errors.description)}
        />
        {errors.description && <span className="field-error">{errors.description}</span>}
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={form.priority}
            onChange={(e) => onChange("priority", e.target.value)}
            aria-invalid={Boolean(errors.priority)}
          >
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          {errors.priority && <span className="field-error">{errors.priority}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => onChange("status", e.target.value)}
            aria-invalid={Boolean(errors.status)}
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {errors.status && <span className="field-error">{errors.status}</span>}
        </div>
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

export const defaultTaskForm: TaskFormState = {
  title: "",
  description: "",
  priority: "Medium",
  status: "Open",
};
