import { useEffect, useState, useCallback, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getTaskById, updateTask } from "../../services/task.service";
import { ErrorState } from "../../components/ErrorState";
import { LoadingState } from "../../components/LoadingState";
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

export function EditTaskPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const [form, setForm] = useState<TaskFormState>(defaultTaskForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const loadTask = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const task = await getTaskById(id);
      setForm({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        assignedTo: task.assignedTo ?? ASSIGNEE_SELF,
      });
    } catch (err) {
      setError(getApiErrorMessage(err, t("tasks.edit.loadError")));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void loadTask();
  }, [loadTask]);

  const handleChange = (key: keyof TaskFormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: "" }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;

    const result = validateTaskForm(t, form);
    if (!result.valid || !result.data) {
      setErrors(result.errors ?? { form: t("tasks.edit.fixFields") });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await updateTask(id, {
        ...result.data,
        assignedTo: result.data.assignedTo === ASSIGNEE_SELF && user ? user.id : result.data.assignedTo || undefined,
      } as TaskInput);
      toast.success(t("tasks.edit.success"));
      navigate(ROUTES.TASKS);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t("tasks.edit.error")));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="tasks-page">
        <LoadingState message={t("tasks.edit.loading")} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="tasks-page">
        <ErrorState message={error} onRetry={loadTask} />
      </div>
    );
  }

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div>
          <h1>{t("tasks.edit.title")}</h1>
          <p className="page-desc muted">{t("tasks.edit.description")}</p>
        </div>
      </div>

      <div className="card task-form-card">
        <TaskForm
          form={form}
          errors={errors}
          submitting={submitting}
          submitLabel={t("tasks.edit.submit")}
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
