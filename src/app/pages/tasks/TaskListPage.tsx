import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { toast } from "react-toastify";
import { deleteTask, getTasks } from "../../services/task.service";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { LoadingState } from "../../components/LoadingState";
import { PriorityBadge } from "../../components/PriorityBadge";
import { StatusBadge } from "../../components/StatusBadge";
import { useTranslation } from "../../hooks/useTranslation";
import { DEFAULT_TASK_SORT, TASK_PAGE_SIZE } from "../../constants/pagination";
import { TASK_SORT_OPTIONS } from "../../constants/task";
import { ROUTES, taskEditPath } from "../../constants/routes";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatDate } from "../../utils/format";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_I18N_KEY,
  TASK_STATUSES,
  TASK_STATUS_I18N_KEY,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "../../types/task";
import "./TasksPage.css";

export function TaskListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "">("");
  const [sort, setSort] = useState(DEFAULT_TASK_SORT);
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
        limit: TASK_PAGE_SIZE,
        sort,
      });
      setTasks(response.Tasks);
      setTotal(response.total);
    } catch (err) {
      setError(getApiErrorMessage(err, t("tasks.list.loadError")));
    } finally {
      setLoading(false);
    }
  }, [page, search, priorityFilter, sort, statusFilter, t]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, priorityFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(total / TASK_PAGE_SIZE));

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    setDeleteTarget(null);
    try {
      await deleteTask(deleteTarget.id);
      toast.success(t("tasks.list.deleteSuccess"));
      if (tasks.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadTasks();
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, t("tasks.list.deleteError")));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="tasks-page">
        <div className="tasks-header">
          <div>
            <h1>{t("tasks.list.title")}</h1>
            <p className="page-desc muted">{t("tasks.list.description")}</p>
          </div>
          <Link to={ROUTES.TASKS_NEW} className="btn">
            {t("tasks.list.createTask")}
          </Link>
        </div>

        <div className="tasks-toolbar">
          <div className="search-input">
            <Search size={16} />
            <input
              type="search"
              placeholder={t("tasks.list.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={t("tasks.list.searchAria")}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "")}
            aria-label={t("tasks.list.filterStatusAria")}
          >
            <option value="">{t("tasks.list.allStatuses")}</option>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`task.status.${TASK_STATUS_I18N_KEY[status]}`)}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "")}
            aria-label={t("tasks.list.filterPriorityAria")}
          >
            <option value="">{t("tasks.list.allPriorities")}</option>
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {t(`task.priority.${TASK_PRIORITY_I18N_KEY[priority]}`)}
              </option>
            ))}
          </select>

          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label={t("tasks.list.sortAria")}>
            {TASK_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </div>

        {loading && <LoadingState message={t("tasks.list.loading")} />}
        {!loading && error && <ErrorState message={error} onRetry={loadTasks} />}
        {!loading && !error && tasks.length === 0 && (
          <EmptyState
            title={t("tasks.list.emptyTitle")}
            description={search ? t("tasks.list.emptySearch") : t("tasks.list.emptyDefault")}
            actionLabel={t("tasks.list.createTask")}
            onAction={() => navigate(ROUTES.TASKS_NEW)}
          />
        )}

        {!loading && !error && tasks.length > 0 && (
          <div className="tasks-table">
            <div className="table-header">
              <span>{t("tasks.list.colTitle")}</span>
              <span>{t("tasks.list.colStatus")}</span>
              <span>{t("tasks.list.colPriority")}</span>
              <span>{t("tasks.list.colCreated")}</span>
              <span>{t("tasks.list.colUpdated")}</span>
              <span>{t("tasks.list.colActions")}</span>
            </div>

            {tasks.map((task) => (
              <div key={task.id} className="table-row">
                <div className="task-title-cell">
                  <strong>{task.title}</strong>
                  <span>{task.description || t("tasks.list.noDescription")}</span>
                </div>
                <div>
                  <StatusBadge status={task.status} />
                </div>
                <div>
                  <PriorityBadge priority={task.priority} />
                </div>
                <div className="small">{formatDate(task.createdAt, t("common.notAvailable"))}</div>
                <div className="small">{formatDate(task.updatedAt, t("common.notAvailable"))}</div>
                <div className="row-actions">
                  <button
                    type="button"
                    className="action-btn edit-btn"
                    onClick={() => navigate(taskEditPath(task.id))}
                  >
                    {t("tasks.list.edit")}
                  </button>
                  <button
                    type="button"
                    className="action-btn delete-btn"
                    disabled={deletingId === task.id}
                    onClick={() => setDeleteTarget(task)}
                  >
                    {deletingId === task.id ? t("common.deleting") : t("tasks.list.delete")}
                  </button>
                </div>
              </div>
            ))}

            <div className="tasks-pagination">
              <span className="small">
                {t("tasks.list.pagination", { page, totalPages, total })}
              </span>
              <div className="pagination-controls">
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  {t("common.previous")}
                </button>
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  {t("common.next")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <>
          <div className="modal-backdrop" onClick={() => setDeleteTarget(null)} role="presentation" />
          <div className="delete-confirm-modal">
            <div className="delete-confirm-header">
              <h3>{t("tasks.list.deleteModalTitle")}</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setDeleteTarget(null)}
                aria-label={t("common.close")}
              >
                ×
              </button>
            </div>
            <div className="delete-confirm-body">
              {t("tasks.list.deleteModalBody", { title: deleteTarget.title })}
            </div>
            <div className="delete-confirm-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>
                {t("common.cancel")}
              </button>
              <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>
                {t("common.confirm")}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
