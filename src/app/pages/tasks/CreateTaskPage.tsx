import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { createTask } from "../../services/task.service";
import { defaultTaskForm, TaskForm, type TaskFormState } from "./TaskForm";
import { validateTaskForm } from "./validation";
import type { TaskInput } from "../../types/task";
import "./TasksPage.css";

export function CreateTaskPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<TaskFormState>(defaultTaskForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

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
      await createTask(result.data as TaskInput);
      toast.success("Task created successfully.");
      navigate("/Goals");
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
    <div className="Goals-page">
      <div className="Goals-header">
        <div>
          <h1>Create Task</h1>
          <p className="page-desc muted">Add a new task to your workspace</p>
        </div>
      </div>

      <div className="card task-form-card">
        <TaskForm
          form={form}
          errors={errors}
          submitting={submitting}
          submitLabel="Create Task"
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/Goals")}
        />
      </div>
    </div>
  );
}
