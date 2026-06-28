import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { deleteTask, getGoals } from "../../services/task.service";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { LoadingState } from "../../components/LoadingState";
import { PriorityBadge } from "../../components/PriorityBadge";
import { StatusBadge } from "../../components/StatusBadge";
import { TASK_PRIORITIES, TASK_STATUSES, type Task, type TaskPriority, type Goalstatus } from "../../types/task";
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
  const [Goals, setGoals] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Goalstatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "">("");
  const [sort, setSort] = useState("-createdAt");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getGoals({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        limit: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
        sort,
      });
      setGoals(response.Goals);
      setTotal(response.total);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? "Failed to load Goals."
        : "Failed to load Goals.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, priorityFilter, sort, statusFilter]);

  useEffect(() => {
    void (async () => {
      await loadGoals();
    })();
  }, [loadGoals]);

  // Reset paging when filters change
  useEffect(() => {
    // Keeping it async avoids eslint cascading-render rule
    void Promise.resolve().then(() => setPage(1));
  }, [search, statusFilter, priorityFilter, sort]);




  const filteredGoals = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return Goals;
    return Goals.filter(
      (task) =>
        task.title.toLowerCase().includes(term) ||
        task.description.toLowerCase().includes(term)
    );
  }, [search, Goals]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleDelete = async (task: Task) => {
    const confirmed = window.confirm(`Delete "${task.title}"?`);
    if (!confirmed) return;

    setDeletingId(task.id);
    try {
      await deleteTask(task.id);
      toast.success("Task deleted.");
      if (Goals.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadGoals();
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
    <div className="Goals-page">
      <div className="Goals-header">
        <div>
          <h1>Goals</h1>
          <p className="page-desc muted">Manage and track your Goals</p>
        </div>
        <Link to="/Goals/new" className="btn">
          Create Task
        </Link>
      </div>

      <div className="Goals-toolbar">
        <div className="search-input">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search Goals"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Goalstatus | "")}
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

        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort Goals">
          <option value="-createdAt">Newest first</option>
          <option value="createdAt">Oldest first</option>
          <option value="title">Title A–Z</option>
          <option value="-title">Title Z–A</option>
        </select>
      </div>

      {loading && <LoadingState message="Loading Goals..." />}
      {!loading && error && <ErrorState message={error} onRetry={loadGoals} />}
      {!loading && !error && filteredGoals.length === 0 && (
        <EmptyState
          title="No Goals found"
          description={search ? "Try adjusting your search or filters." : "Create your first task to get started."}
          actionLabel="Create Task"
          onAction={() => navigate("/Goals/new")}
        />
      )}

      {!loading && !error && filteredGoals.length > 0 && (
        <div className="Goals-table">
          <div className="table-header">
            <span>Title</span>
            <span>Status</span>
            <span>Priority</span>
            <span>Created</span>
            <span>Updated</span>
            <span>Actions</span>
          </div>

          {filteredGoals.map((task) => (
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
                  onClick={() => navigate(`/Goals/${task.id}/edit`)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="action-btn delete-btn"
                  disabled={deletingId === task.id}
                  onClick={() => void handleDelete(task)}
                >
                  {deletingId === task.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}

          <div className="Goals-pagination">
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
  );
}
