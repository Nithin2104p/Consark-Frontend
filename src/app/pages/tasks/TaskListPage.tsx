import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { deleteTask, getTasks } from "../../services/task.service";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { LoadingState } from "../../components/LoadingState";
import { PriorityBadge } from "../../components/PriorityBadge";
import { StatusBadge } from "../../components/StatusBadge";
import { TASK_PRIORITIES, TASK_STATUSES, type Task, type TaskPriority, type TaskStatus } from "../../types/task";
import "./TasksPage.css";

const PAGE_SIZE = 8;

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function TaskListPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "">("");
  const [sort, setSort] = useState("-createdAt");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTasks({
        search: search || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        page,
        limit: PAGE_SIZE,
        sort,
      });
      setTasks(response.Tasks);
      setTotal(response.total);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? "Failed to load tasks."
        : "Failed to load tasks.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, search, priorityFilter, sort, statusFilter]);

  useEffect(() => {
    void (async () => {
      await loadTasks();
    })();
  }, [loadTasks]);

  useEffect(() => {
    void Promise.resolve().then(() => setPage(1));
  }, [search, statusFilter, priorityFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleDeleteClick = (task: Task) => {
    setDeleteTarget(task);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    setDeleteTarget(null);
    try {
      await deleteTask(deleteTarget.id);
      toast.success("Task deleted.");
      if (tasks.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadTasks();
      }
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? "Failed to delete task."
        : "Failed to delete task.";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="tasks-page">
        <div className="tasks-header">
          <div>
            <h1>Tasks</h1>
            <p className="page-desc muted">Manage and track your tasks</p>
          </div>
          <Link to="/tasks/new" className="btn">
            Create Task
          </Link>
        </div>

        <div className="tasks-toolbar">
          <div className="search-input">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search tasks"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "")}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "")}
            aria-label="Filter by priority"
          >
            <option value="">All priorities</option>
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>

          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort tasks">
            <option value="-createdAt">Newest first</option>
            <option value="createdAt">Oldest first</option>
            <option value="title">Title A–Z</option>
            <option value="-title">Title Z–A</option>
          </select>
        </div>

        {loading && <LoadingState message="Loading tasks..." />}
        {!loading && error && <ErrorState message={error} onRetry={loadTasks} />}
        {!loading && !error && tasks.length === 0 && (
          <EmptyState
            title="No tasks found"
            description={search ? "Try adjusting your search or filters." : "Create your first task to get started."}
            actionLabel="Create Task"
            onAction={() => navigate("/tasks/new")}
          />
        )}

        {!loading && !error && tasks.length > 0 && (
          <div className="tasks-table">
            <div className="table-header">
              <span>Title</span>
              <span>Status</span>
              <span>Priority</span>
              <span>Created</span>
              <span>Updated</span>
              <span>Actions</span>
            </div>

            {tasks.map((task) => (
              <div key={task.id} className="table-row">
                <div className="task-title-cell">
                  <strong>{task.title}</strong>
                  <span>{task.description || "No description"}</span>
                </div>
                <div>
                  <StatusBadge status={task.status} />
                </div>
                <div>
                  <PriorityBadge priority={task.priority} />
                </div>
                <div className="small">{formatDate(task.createdAt)}</div>
                <div className="small">{formatDate(task.updatedAt)}</div>
                <div className="row-actions">
                  <button
                    type="button"
                    className="action-btn edit-btn"
                    onClick={() => navigate(`/tasks/${task.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="action-btn delete-btn"
                    disabled={deletingId === task.id}
                    onClick={() => handleDeleteClick(task)}
                  >
                    {deletingId === task.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}

            <div className="tasks-pagination">
              <span className="small">
                Page {page} of {totalPages} · {total} total
              </span>
              <div className="pagination-controls">
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <>
          <div
            className="modal-backdrop"
            onClick={handleCancelDelete}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCancelDelete();
              }
            }}
          />
          <div className="delete-confirm-modal">
            <div className="delete-confirm-header">
              <h3>Delete Task</h3>
              <button
                type="button"
                className="modal-close"
                onClick={handleCancelDelete}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="delete-confirm-body">
              Are you sure you want to delete "{deleteTarget.title}"? This action cannot be undone.
            </div>
            <div className="delete-confirm-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancelDelete}
                disabled={deletingId === deleteTarget.id}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
                disabled={deletingId === deleteTarget.id}
              >
                {deletingId === deleteTarget.id ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
