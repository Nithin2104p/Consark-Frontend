import { useMemo, useState, useEffect, useCallback, type FormEvent } from "react";
import { toast } from "react-toastify";
import { getUsers, createUser, getUserById, type UserDto, type CreateUserPayload } from "../../services/user.service";
import { useTranslation } from "../../hooks/useTranslation";
import { validateEmployeeForm } from "../../validation/auth";
import { StatusBadge } from "../../components/StatusBadge";
import { PriorityBadge } from "../../components/PriorityBadge";
import { EMPLOYEES_PAGE_SIZE } from "../../constants/pagination";
import { AVATAR_PLACEHOLDER_BASE } from "../../constants/ui";
import { ROLES } from "../../auth/permissions";
import { COUNTRY_OPTIONS } from "../../data/countryCoordinates";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatDate, formatUserName } from "../../utils/format";
import type { Task } from "../../types/task";
import "./EmployeesList.css";

const DEFAULT_USER_FORM: CreateUserPayload = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  companyName: "",
  isActive: true,
  roleId: ROLES.EMPLOYEE,
  location: "",
};

function avatarUrl(userId: string): string {
  return AVATAR_PLACEHOLDER_BASE + encodeURIComponent(userId);
}

export function EmployeesList() {
  const { t } = useTranslation();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserTasks, setSelectedUserTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const refreshUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await getUsers({ page, limit: EMPLOYEES_PAGE_SIZE });
      setUsers(next.users);
      setTotalPages(next.pagination.totalPages);
    } catch {
      setError(t("employees.loadError"));
    } finally {
      setLoading(false);
    }
  }, [page, t]);

  useEffect(() => {
    void refreshUsers();
  }, [refreshUsers]);

  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUserTasks([]);
      return;
    }
    setTasksLoading(true);
    void (async () => {
      try {
        const userWithTasks = await getUserById(selectedUserId);
        setSelectedUserTasks(userWithTasks.tasks ?? []);
      } catch {
        setSelectedUserTasks([]);
      } finally {
        setTasksLoading(false);
      }
    })();
  }, [selectedUserId]);

  const safePage = Math.min(page, totalPages);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userForm, setUserForm] = useState<CreateUserPayload>(DEFAULT_USER_FORM);
  const [userErrors, setUserErrors] = useState<Record<string, string>>({});
  const [submittingUser, setSubmittingUser] = useState(false);

  const handleUserChange = (key: keyof CreateUserPayload, value: string | boolean) => {
    setUserForm((current) => ({ ...current, [key]: value }));
    if (userErrors[key]) {
      setUserErrors((current) => ({ ...current, [key]: "" }));
    }
  };

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateEmployeeForm(t, {
      firstName: userForm.firstName,
      email: userForm.email,
    });
    if (Object.keys(nextErrors).length > 0) {
      setUserErrors(nextErrors);
      return;
    }

    setUserErrors({});
    setSubmittingUser(true);
    try {
      await createUser(userForm);
      toast.success(t("employees.createSuccess"));
      setShowAddUserModal(false);
      setUserForm(DEFAULT_USER_FORM);
      await refreshUsers();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t("employees.createError")));
    } finally {
      setSubmittingUser(false);
    }
  };

  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    return users.find((e) => e._id === selectedUserId) ?? null;
  }, [users, selectedUserId]);

  const formatCreatedDate = (value: string | undefined) =>
    formatDate(value, t("common.notAvailable"), {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  useEffect(() => {
    const hasOverlay = selectedUserId !== null || showAddUserModal;
    document.body.style.overflow = hasOverlay ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedUserId, showAddUserModal]);

  return (
    <div className="employees-list">
      <div className="employees-list-header">
        <div>
          <h2>{t("employees.title")}</h2>
          <p className="muted page-desc">{t("employees.description")}</p>
        </div>
        <button className="btn btn-add-user" type="button" onClick={() => setShowAddUserModal(true)}>
          {t("employees.createUser")}
        </button>
      </div>

      {loading && <p className="muted">{t("employees.loading")}</p>}
      {!loading && error && <p className="muted">{error}</p>}

      {!loading && !error && (
        <>
          <div className="employees-table">
            <div className="table-header-employee">
              <div className="col-avatar">{t("employees.colAvatar")}</div>
              <div className="col-name">{t("employees.colName")}</div>
              <div className="col-email">{t("employees.colEmail")}</div>
              <div className="col-status">{t("employees.colStatus")}</div>
            </div>

            {users.map((user) => (
              <button
                type="button"
                key={user._id}
                className={
                  selectedUserId === user._id
                    ? "table-row-employee is-selected"
                    : "table-row-employee"
                }
                onClick={() => setSelectedUserId(user._id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedUserId(user._id);
                  }
                }}
              >
                <div className="col-avatar">
                  <img
                    className="employee-avatar"
                    src={avatarUrl(user._id)}
                    alt={formatUserName(user)}
                  />
                </div>
                <div className="col-name">{formatUserName(user)}</div>
                <div className="col-email">{user.email}</div>
                <div className="col-status">
                  <span className={`status-tag ${user.isActive ? "active" : "inactive"}`}>
                    {user.isActive ? t("employees.active") : t("employees.inactive")}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="employees-pagination">
            <button
              className="employees-pagination-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
            >
              {t("common.previous")}
            </button>

            <div className="employees-pagination-pages">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`employees-pagination-page-btn ${p === safePage ? "active" : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              className="employees-pagination-btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
            >
              {t("common.next")}
            </button>
          </div>

          {selectedUser && (
            <>
              <div
                className="employees-backdrop"
                onClick={() => setSelectedUserId(null)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedUserId(null);
                  }
                }}
              />
              <aside className="employee-sidebar">
                <div className="employee-sidebar-header">
                  <div className="employee-sidebar-title">
                    <img
                      className="employee-sidebar-avatar"
                      src={avatarUrl(selectedUser._id)}
                      alt={formatUserName(selectedUser)}
                    />
                    <div>
                      <h3>{formatUserName(selectedUser)}</h3>
                      <div className="employee-sidebar-sub">
                        {selectedUser.isActive ? t("employees.active") : t("employees.inactive")}
                      </div>
                    </div>
                  </div>
                  <button
                    className="employee-sidebar-close"
                    type="button"
                    onClick={() => setSelectedUserId(null)}
                    aria-label={t("employees.closePanel")}
                  >
                    ×
                  </button>
                </div>

                <div className="employee-sidebar-section">
                  <h4>{t("employees.sidebarUserDetails")}</h4>
                  <div className="employee-kv">
                    <div className="kv">
                      <div className="k">{t("employees.sidebarEmail")}</div>
                      <div className="v">{selectedUser.email}</div>
                    </div>
                    <div className="kv">
                      <div className="k">{t("employees.sidebarName")}</div>
                      <div className="v">{formatUserName(selectedUser)}</div>
                    </div>
                    <div className="kv">
                      <div className="k">{t("employees.sidebarStatus")}</div>
                      <div className="v">
                        {selectedUser.isActive ? t("employees.active") : t("employees.inactive")}
                      </div>
                    </div>
                    <div className="kv">
                      <div className="k">{t("employees.sidebarCreated")}</div>
                      <div className="v">{formatCreatedDate(selectedUser.createdAt)}</div>
                    </div>
                  </div>
                </div>

                <div className="employee-sidebar-section">
                  <h4>{t("employees.sidebarTasksTitle", { count: selectedUserTasks.length })}</h4>
                  {tasksLoading && <p className="muted">{t("employees.sidebarLoadingTasks")}</p>}
                  {!tasksLoading && selectedUserTasks.length === 0 && (
                    <p className="muted">{t("employees.sidebarNoTasks")}</p>
                  )}
                  {!tasksLoading && selectedUserTasks.length > 0 && (
                    <div className="employee-tasks-list">
                      {selectedUserTasks.map((task) => (
                        <div key={task.id} className="employee-task-card">
                          <div className="employee-task-title">{task.title}</div>
                          <div className="employee-task-meta">
                            <StatusBadge status={task.status} />
                            <PriorityBadge priority={task.priority} />
                          </div>
                          <div className="employee-task-desc">
                            {task.description || t("tasks.list.noDescription")}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </aside>
            </>
          )}
        </>
      )}

      {showAddUserModal && (
        <>
          <div
            className="employees-backdrop"
            onClick={() => setShowAddUserModal(false)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setShowAddUserModal(false);
              }
            }}
          />
          <div className="add-user-modal">
            <div className="add-user-modal-header">
              <h3>{t("employees.addUserModalTitle")}</h3>
              <button
                className="employee-sidebar-close"
                type="button"
                onClick={() => setShowAddUserModal(false)}
                aria-label={t("common.close")}
              >
                ×
              </button>
            </div>
            <form className="task-form" onSubmit={handleCreateUser} noValidate>
              <div className="form-field">
                <label htmlFor="firstName">{t("employees.formFirstName")}</label>
                <input
                  id="firstName"
                  type="text"
                  value={userForm.firstName}
                  onChange={(e) => handleUserChange("firstName", e.target.value)}
                  placeholder={t("employees.formFirstNamePlaceholder")}
                  aria-invalid={Boolean(userErrors.firstName)}
                />
                {userErrors.firstName && <span className="field-error">{userErrors.firstName}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="lastName">{t("employees.formLastName")}</label>
                <input
                  id="lastName"
                  type="text"
                  value={userForm.lastName ?? ""}
                  onChange={(e) => handleUserChange("lastName", e.target.value)}
                  placeholder={t("employees.formLastNamePlaceholder")}
                />
              </div>

              <div className="form-field">
                <label htmlFor="email">{t("employees.formEmail")}</label>
                <input
                  id="email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => handleUserChange("email", e.target.value)}
                  placeholder={t("employees.formEmailPlaceholder")}
                  aria-invalid={Boolean(userErrors.email)}
                />
                {userErrors.email && <span className="field-error">{userErrors.email}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="location">{t("employees.formLocation")}</label>
                <select
                  id="location"
                  value={userForm.location ?? ""}
                  onChange={(e) => handleUserChange("location", e.target.value)}
                >
                  <option value="">{t("employees.selectCountry")}</option>
                  {COUNTRY_OPTIONS.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddUserModal(false)}
                  disabled={submittingUser}
                >
                  {t("common.cancel")}
                </button>
                <button type="submit" className="btn" disabled={submittingUser}>
                  {submittingUser ? t("employees.creating") : t("employees.submitCreate")}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
