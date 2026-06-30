import { useEffect, useState, useCallback, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { getTaskById, updateTask } from "../../services/task.service";
import { getUsers, type UserDto } from "../../services/user.service";
import { ErrorState } from "../../components/ErrorState";
import { LoadingState } from "../../components/LoadingState";
import { defaultTaskForm, TaskForm, type TaskFormState } from "./TaskForm";
import { validateTaskForm } from "./validation";
import { useTranslation } from "../../hooks/useTranslation";
import { ASSIGNEE_PAGE_SIZE } from "../../constants/pagination";
import { ROUTES } from "../../constants/routes";
import type { TaskInput } from "../../types/task";
import { useAuth } from "../../auth/AuthContext";
import { hasPermission, PERMISSIONS } from "../../auth/permissions";
import "./TasksPage.css";

function mapAssignees(users: UserDto[]) {
  return users.map((u) => ({
    id: u._id,
    name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email,
  }));
}

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
  const [assignees, setAssignees] = useState<UserDto[]>([]);
  const [assigneePage, setAssigneePage] = useState(1);
  const [assigneeTotalPages, setAssigneeTotalPages] = useState(1);
  const [assigneeLoading, setAssigneeLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const canAssign = hasPermission(role, PERMISSIONS.TASKS_ASSIGN);

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
        assignedTo: task.assignedTo ?? "self",
      });
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? t("tasks.edit.loadError")
        : t("tasks.edit.loadError");
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  const loadAssignees = useCallback(async (page: number, search: string) => {
    setAssigneeLoading(true);
    try {
      const res = await getUsers({ page, limit: ASSIGNEE_PAGE_SIZE, search: search || undefined });
      setAssignees(res.users);
      setAssigneePage(res.pagination.page);
      setAssigneeTotalPages(res.pagination.totalPages);
    } catch {
      setAssignees([]);
      setAssigneeTotalPages(1);
    } finally {
      setAssigneeLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTask();
  }, [loadTask]);

  useEffect(() => {
    if (!canAssign) return;
    void loadAssignees(1, "");
  }, [canAssign, loadAssignees]);

  const handleAssigneeLoadMore = useCallback(async () => {
    if (assigneeLoading) return;
    const nextPage = assigneePage + 1;
    setAssigneeLoading(true);
    try {
      const res = await getUsers({ page: nextPage, limit: ASSIGNEE_PAGE_SIZE, search: searchQuery || undefined });
      setAssignees((prev) => [...prev, ...res.users]);
      setAssigneePage(res.pagination.page);
      setAssigneeTotalPages(res.pagination.totalPages);
    } catch {
      // keep existing
    } finally {
      setAssigneeLoading(false);
    }
  }, [assigneeLoading, assigneePage, searchQuery]);

  const handleAssigneeSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      void loadAssignees(1, query);
    },
    [loadAssignees]
  );

  const handleChange = (key: keyof TaskFormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: "" }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;

    const result = validateTaskForm(form);
    if (!result.valid || !result.data) {
      setErrors(result.errors ?? { form: t("tasks.edit.fixFields") });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await updateTask(id, {
        ...result.data,
        assignedTo: result.data.assignedTo === "self" && user ? user.id : result.data.assignedTo || undefined,
      } as TaskInput);
      toast.success(t("tasks.edit.success"));
      navigate(ROUTES.TASKS);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? t("tasks.edit.error")
        : t("tasks.edit.error");
      toast.error(message);
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
          assignees={mapAssignees(assignees)}
          assigneeLoading={assigneeLoading}
          assigneeHasMore={assigneePage < assigneeTotalPages}
          onAssigneeLoadMore={handleAssigneeLoadMore}
          assigneeSearchQuery={searchQuery}
          onAssigneeSearchChange={handleAssigneeSearchChange}
        />
      </div>
    </div>
  );
}
