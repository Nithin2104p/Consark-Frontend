import { useEffect, useState, useCallback, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { createTask } from "../../services/task.service";
import { getUsers, type UserDto } from "../../services/user.service";
import { defaultTaskForm, TaskForm, type TaskFormState } from "./TaskForm";
import { validateTaskForm } from "./validation";
import type { TaskInput } from "../../types/task";
import { useAuth } from "../../auth/AuthContext";
import { hasPermission, PERMISSIONS } from "../../auth/permissions";
import "./TasksPage.css";

export function CreateTaskPage() {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const [form, setForm] = useState<TaskFormState>(defaultTaskForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [assignees, setAssignees] = useState<UserDto[]>([]);
  const [assigneePage, setAssigneePage] = useState(1);
  const [assigneeTotalPages, setAssigneeTotalPages] = useState(1);
  const [assigneeLoading, setAssigneeLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const canAssign = hasPermission(role, PERMISSIONS.TASKS_ASSIGN);

  const loadAssignees = useCallback(async (page: number, search: string) => {
    setAssigneeLoading(true);
    try {
      const res = await getUsers({ page, limit: 20, search: search || undefined });
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
    if (!canAssign) return;
    const timer = setTimeout(() => {
      void loadAssignees(1, "");
    }, 0);
    return () => clearTimeout(timer);
  }, [canAssign, loadAssignees]);

  const handleAssigneeLoadMore = useCallback(async () => {
    if (assigneeLoading) return;
    const nextPage = assigneePage + 1;
    setAssigneeLoading(true);
    try {
      const res = await getUsers({ page: nextPage, limit: 20, search: searchQuery || undefined });
      setAssignees((prev) => [...prev, ...res.users]);
      setAssigneePage(res.pagination.page);
      setAssigneeTotalPages(res.pagination.totalPages);
    } catch {
      // keep existing
    } finally {
      setAssigneeLoading(false);
    }
  }, [assigneeLoading, assigneePage, searchQuery]);

  const handleAssigneeSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    void loadAssignees(1, query);
  }, [loadAssignees]);

  const handleChange = (key: keyof TaskFormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) {
      setErrors((current) => ({ ...current, [key]: "" }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateTaskForm(form);
    if (!result.valid || !result.data) {
      setErrors(result.errors ?? { form: "Please fix the highlighted fields." });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await createTask({
        ...result.data,
        assignedTo: result.data.assignedTo === "self" && user ? user.id : result.data.assignedTo || undefined,
      } as TaskInput);
      toast.success("Task created successfully.");
      navigate("/tasks");
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? "Failed to create task."
        : "Failed to create task.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div>
          <h1>Create Task</h1>
          <p className="page-desc muted">Add a new task to your workspace</p>
        </div>
      </div>

      <div className="card task-form-card task-form-card--centered">
        <TaskForm
          form={form}
          errors={errors}
          submitting={submitting}
          submitLabel="Create Task"
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/tasks")}
          showAssignee={canAssign}
          assignees={(Array.isArray(assignees) ? assignees : []).map((u) => ({ id: u._id, name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email }))}
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
