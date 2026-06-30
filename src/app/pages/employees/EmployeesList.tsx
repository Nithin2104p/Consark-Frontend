import { useMemo, useState, useEffect, useCallback, type FormEvent } from "react";
import axios from "axios";
import { getUsers, createUser, getUserById, type UserDto, type CreateUserPayload } from "../../services/user.service";
import { useTranslation } from "../../hooks/useTranslation";
import { toast } from "react-toastify";
import { EMPLOYEES_PAGE_SIZE } from "../../constants/pagination";
import { AVATAR_PLACEHOLDER_BASE } from "../../constants/ui";
import { ROLES } from "../../auth/permissions";
import { COUNTRY_OPTIONS } from "../../data/countryCoordinates";
import "./EmployeesList.css";



export function EmployeesList() {
  const { t } = useTranslation();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserTasks, setSelectedUserTasks] = useState<import("../../types/task").Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const limit = EMPLOYEES_PAGE_SIZE;

  const refreshUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await getUsers({ page, limit });
      setUsers(next.users);
      setTotalPages(next.pagination.totalPages);
    } catch {
      setError(t("employees.loadError"));
    } finally {
      setLoading(false);
    }
  }, [page, limit, t]);

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
  const [userForm, setUserForm] = useState<CreateUserPayload>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    companyName: "",
    isActive: true,
    roleId: ROLES.EMPLOYEE,
    location: "",
  });
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
    const nextErrors: Record<string, string> = {};
    if (!userForm.firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!userForm.email.trim()) nextErrors.email = "Email is required.";
    if (Object.keys(nextErrors).length > 0) {
      setUserErrors(nextErrors);
      return;
    }

    setUserErrors({});
    setSubmittingUser(true);
    try {
      await createUser(userForm);
      toast.success("User created successfully.");
      setShowAddUserModal(false);
      setUserForm({ firstName: "", lastName: "", email: "", password: "", companyName: "", isActive: true, roleId: ROLES.EMPLOYEE, location: "" });
      await refreshUsers();
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? "Failed to create user."
        : "Failed to create user.";
      toast.error(message);
    } finally {
      setSubmittingUser(false);
    }
  };

  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    return users.find((e) => e._id === selectedUserId) ?? null;
  }, [users, selectedUserId]);

  function formatName(user: UserDto) {
    const first = (user.firstName ?? "").trim();
    const last = (user.lastName ?? "").trim();
    return `${first} ${last}`.trim() || user.email;
  }

  function formatDate(value: string | undefined) {
    if (!value) return t("common.notAvailable");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Disable body scroll when sidebar is open
  useEffect(() => {
    const hasOverlay = selectedUserId !== null || showAddUserModal;
    if (hasOverlay) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedUserId, showAddUserModal]);

  return (
    <div className="employees-list">
      <div className="employees-list-header">
        <div>
          <h2>{t("pages.employees.title")}</h2>
          <p className="muted page-desc">{t("pages.employees.description")}</p>
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
              <div className="col-avatar">Avatar</div>
              <div className="col-name">Name</div>
              <div className="col-email">Email</div>
              <div className="col-status">Status</div>
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
                    src={AVATAR_PLACEHOLDER_BASE + encodeURIComponent(user._id)}
                    alt={formatName(user)}
                  />
                </div>
                <div className="col-name">{formatName(user)}</div>
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
                      src={"https://i.pravatar.cc/150?u=" + encodeURIComponent(selectedUser._id)}
                      alt={formatName(selectedUser)}
                    />
                    <div>
                      <h3>{formatName(selectedUser)}</h3>
                      <div className="employee-sidebar-sub">{selectedUser.isActive ? "Active" : "Inactive"}</div>
                    </div>
                  </div>
                  <button
                    className="employee-sidebar-close"
                    type="button"
                    onClick={() => setSelectedUserId(null)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                <div className="employee-sidebar-section">
                  <h4>User details</h4>
                  <div className="employee-kv">
                    <div className="kv">
                      <div className="k">Email</div>
                      <div className="v">{selectedUser.email}</div>
                    </div>
                    <div className="kv">
                      <div className="k">Name</div>
                      <div className="v">{formatName(selectedUser)}</div>
                    </div>
                    <div className="kv">
                      <div className="k">Status</div>
                      <div className="v">{selectedUser.isActive ? "Active" : "Inactive"}</div>
                    </div>
                    <div className="kv">
                      <div className="k">Created</div>
                      <div className="v">{formatDate(selectedUser.createdAt)}</div>
                    </div>
                  </div>
                </div>

                <div className="employee-sidebar-section">
                  <h4>Tasks ({selectedUserTasks.length})</h4>
                  {tasksLoading && <p className="muted">Loading tasks...</p>}
                  {!tasksLoading && selectedUserTasks.length === 0 && (
                    <p className="muted">No tasks found for this user.</p>
                  )}
                  {!tasksLoading && selectedUserTasks.length > 0 && (
                    <div className="employee-tasks-list">
                      {selectedUserTasks.map((task) => (
                        <div key={task.id} className="employee-task-card">
                          <div className="employee-task-title">{task.title}</div>
                          <div className="employee-task-meta">
                            <span className={`status-tag ${task.status === "In-Progress" ? "inprogress" : task.status.toLowerCase()}`}>
                              {task.status}
                            </span>
                            <span className={`priority-tag ${task.priority.toLowerCase()}`}>{task.priority}</span>
                          </div>
                          <div className="employee-task-desc">{task.description || "No description"}</div>
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
              <h3>Add User</h3>
              <button
                className="employee-sidebar-close"
                type="button"
                onClick={() => setShowAddUserModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form className="task-form" onSubmit={handleCreateUser} noValidate>
              <div className="form-field">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  value={userForm.firstName}
                  onChange={(e) => handleUserChange("firstName", e.target.value)}
                  placeholder="Enter first name"
                  aria-invalid={Boolean(userErrors.firstName)}
                />
                {userErrors.firstName && <span className="field-error">{userErrors.firstName}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  value={userForm.lastName ?? ""}
                  onChange={(e) => handleUserChange("lastName", e.target.value)}
                  placeholder="Enter last name"
                />
              </div>

              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => handleUserChange("email", e.target.value)}
                  placeholder="Enter email"
                  aria-invalid={Boolean(userErrors.email)}
                />
                {userErrors.email && <span className="field-error">{userErrors.email}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="location">Location</label>
                <select
                  id="location"
                  value={userForm.location ?? ""}
                  onChange={(e) => handleUserChange("location", e.target.value)}
                >
                  <option value="">Select country</option>
                  {COUNTRY_OPTIONS.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddUserModal(false)} disabled={submittingUser}>
                  Cancel
                </button>
                <button type="submit" className="btn" disabled={submittingUser}>
                  {submittingUser ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
