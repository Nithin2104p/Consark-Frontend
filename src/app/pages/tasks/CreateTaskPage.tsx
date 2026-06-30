import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createTask } from "../../services/task.service";
import { defaultTaskForm, TaskForm, type TaskFormState } from "./TaskForm";
import { validateTaskForm } from "../../validation/task";
import { useTranslation } from "../../hooks/useTranslation";
import { useAssigneeOptions } from "../../hooks/useAssigneeOptions";
import { ASSIGNEE_SELF } from "../../constants/task";
import { ROUTES } from "../../constants/routes";
import type { TaskInput } from "../../types/task";
import { useAuth } from "../../auth/AuthContext";
import { hasPermission, PERMISSIONS } from "../../auth/permissions";
import { getApiErrorMessage } from "../../utils/apiError";
import "./TasksPage.css";

export function CreateTaskPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const [form, setForm] = useState<TaskFormState>(defaultTaskForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const canAssign = hasPermission(role, PERMISSIONS.TASKS_ASSIGN);
  const {
    assigneeOptions,
    assigneeLoading,
    assigneeHasMore,
    searchQuery,
    handleAssigneeLoadMore,
    handleAssigneeSearchChange,
  } = useAssigneeOptions(canAssign);

  const handleChange = (key: keyof TaskFormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: "" }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateTaskForm(t, form);
    if (!result.valid || !result.data) {
      setErrors(result.errors ?? { form: t("tasks.create.fixFields") });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await createTask({
        ...result.data,
        assignedTo: result.data.assignedTo === ASSIGNEE_SELF && user ? user.id : result.data.assignedTo || undefined,
      } as TaskInput);
      toast.success(t("tasks.create.success"));
      navigate(ROUTES.TASKS);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t("tasks.create.error")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div>
          <h1>{t("tasks.create.title")}</h1>
          <p className="page-desc muted">{t("tasks.create.description")}</p>
        </div>
      </div>

      <div className="card task-form-card task-form-card--centered">
        <TaskForm
          form={form}
          errors={errors}
          submitting={submitting}
          submitLabel={t("tasks.create.submit")}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={() => navigate(ROUTES.TASKS)}
          showAssignee={canAssign}
          assignees={assigneeOptions}
          assigneeLoading={assigneeLoading}
          assigneeHasMore={assigneeHasMore}
          onAssigneeLoadMore={handleAssigneeLoadMore}
          assigneeSearchQuery={searchQuery}
          onAssigneeSearchChange={handleAssigneeSearchChange}
        />
      </div>
    </div>
  );
}
