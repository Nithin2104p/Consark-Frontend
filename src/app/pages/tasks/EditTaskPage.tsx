import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { getTaskById, updateTask } from "../../services/task.service";
import { ErrorState } from "../../components/ErrorState";
import { LoadingState } from "../../components/LoadingState";
import { defaultTaskForm, TaskForm, type TaskFormState } from "./TaskForm";
import { validateTaskForm } from "./validation";
import type { TaskInput } from "../../types/task";
import "./TasksPage.css";

export function EditTaskPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<TaskFormState>(defaultTaskForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadTask = async () => {
      setLoading(true);
      setError(null);
      try {
        const task = await getTaskById(id);
        setForm({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
        });
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? (err.response?.data as { message?: string })?.message ?? "Failed to load task."
          : "Failed to load task.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadTask();
  }, [id]);

  const handleChange = (key: keyof TaskFormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) {
      setErrors((current) => ({ ...current, [key]: "" }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;

    const result = validateTaskForm(form);
    if (!result.valid || !result.data) {
      setErrors(result.errors ?? { form: "Please fix the highlighted fields." });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await updateTask(id, result.data as TaskInput);
      toast.success("Task updated successfully.");
      navigate("/Goals");
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? "Failed to update task."
        : "Failed to update task.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="Goals-page">
        <LoadingState message="Loading task..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="Goals-page">
        <ErrorState message={error} onRetry={() => navigate(0)} />
      </div>
    );
  }

  return (
    <div className="Goals-page">
      <div className="Goals-header">
        <div>
          <h1>Edit Task</h1>
          <p className="page-desc muted">Update task details</p>
        </div>
      </div>

      <div className="card task-form-card">
        <TaskForm
          form={form}
          errors={errors}
          submitting={submitting}
          submitLabel="Save Changes"
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/Goals")}
        />
      </div>
    </div>
  );
}
