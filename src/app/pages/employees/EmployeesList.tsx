import { useMemo, useState, useEffect } from "react";
import { getEmployeesLikeFromUsers, type EmployeeLike } from "../../services/user.service";
import { employeeGoalMapping } from "../../data/employeeGoals";
import { GoalsWithGoals as Goals } from "../../data/Goals";
import { goalCompletionPercent } from "../Goals/goalUtils";
import { useTranslation } from "../../hooks/useTranslation";
import "./EmployeesList.css";




export function EmployeesList() {
  const { t } = useTranslation();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<EmployeeLike[]>([]);

  // Pagination
  const pageSize = 7;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(employees.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleEmployees = employees.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const next = await getEmployeesLikeFromUsers();
        setEmployees(next);
      } catch (err) {
        setError("Failed to load employees.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedEmployee = useMemo(() => {
    if (!selectedEmployeeId) return null;
    return employees.find((e) => e.id === selectedEmployeeId) ?? null;
  }, [employees, selectedEmployeeId]);

  const selectedGoals = useMemo(() => {
    if (!selectedEmployee) return [];
    // employeeGoals mapping uses numeric ids from dummy employees.
    // Until backend/contract supports this, use a stable derived numeric id.
    const numericId = Number(String(selectedEmployeeIdToNumber(selectedEmployee.id)));
    const goalIds = employeeGoalMapping[numericId] ?? [];
    const byId = new Map(Goals.map((g) => [g.id, g] as const));
    return goalIds.map((id) => byId.get(id)).filter((g): g is (typeof Goals)[number] => Boolean(g));
  }, [selectedEmployee]);

  function selectedEmployeeIdToNumber(id: string): number {
    return Array.from(id).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 10;
  }

  // Disable body scroll when sidebar is open
  useEffect(() => {
    if (selectedEmployeeId !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedEmployeeId]);

  return (
    <div className="employees-list">
      <h2>{t("pages.employees.title")}</h2>
      <p className="muted page-desc">{t("pages.employees.description")}</p>

      {loading && <p className="muted">Loading employees...</p>}
      {!loading && error && <p className="muted">{error}</p>}


      {!loading && !error && (
        <>
          <div className="employees-table">
            <div className="table-header-employee">
              <div className="col-avatar">Avatar</div>
              <div className="col-name">Name</div>
              <div className="col-email">Email</div>
              <div className="col-manager">Manager</div>
              <div className="col-department">Department</div>
            </div>

            {visibleEmployees.map((emp) => (
              <button
                type="button"
                key={emp.id}
                className={
                  selectedEmployeeId === emp.id
                    ? "table-row-employee is-selected"
                    : "table-row-employee"
                }
                onClick={() => setSelectedEmployeeId(emp.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedEmployeeId(emp.id);
                  }
                }}
              >


                <div className="col-avatar">
                  <img
                    className="employee-avatar"
                    src={emp.avatar ?? "https://i.pravatar.cc/150?u=" + encodeURIComponent(emp.id)}
                    alt={emp.name}
                  />
                </div>
                <div className="col-name">{emp.name}</div>
                <div className="col-email">{emp.email}</div>
                <div className="col-manager">{emp.manager}</div>
                <div className="col-department">
                  <span className="department-tag">{emp.department}</span>
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
              Prev
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
              Next
            </button>
          </div>

          {selectedEmployee && (
            <>
              <div className="employees-backdrop" onClick={() => setSelectedEmployeeId(null)} />
              <aside className="employee-sidebar">
                <div className="employee-sidebar-header">
                  <div className="employee-sidebar-title">
                    <img
                      className="employee-sidebar-avatar"
                      src={
                        selectedEmployee.avatar ??
                        "https://i.pravatar.cc/150?u=" + encodeURIComponent(selectedEmployee.id)
                      }
                      alt={selectedEmployee.name}
                    />
                    <div>
                      <h3>{selectedEmployee.name}</h3>
                      <div className="employee-sidebar-sub">{selectedEmployee.designation}</div>
                    </div>
                  </div>
                  <button
                    className="employee-sidebar-close"
                    type="button"
                    onClick={() => setSelectedEmployeeId(null)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                <div className="employee-sidebar-section">
                  <h4>Employee details</h4>
                  <div className="employee-kv">
                    <div className="kv">
                      <div className="k">Email</div>
                      <div className="v">{selectedEmployee.email}</div>
                    </div>
                    <div className="kv">
                      <div className="k">Manager</div>
                      <div className="v">{selectedEmployee.manager}</div>
                    </div>
                    <div className="kv">
                      <div className="k">Department</div>
                      <div className="v">{selectedEmployee.department}</div>
                    </div>
                    <div className="kv">
                      <div className="k">Country</div>
                      <div className="v">{selectedEmployee.country}</div>
                    </div>
                    <div className="kv">
                      <div className="k">Designation</div>
                      <div className="v">{selectedEmployee.designation}</div>
                    </div>
                    <div className="kv">
                      <div className="k">Projects</div>
                      <div className="v">{selectedEmployee.projects}</div>
                    </div>

                  </div>
                </div>

                <div className="employee-sidebar-section">
                  <h4>Goals & progress</h4>
                  <div className="employee-Goals-list">
                    {selectedGoals.map((g) => {
                      const progress = goalCompletionPercent(g);
                      return (
                        <div key={g.id} className="employee-goal-card">
                          <div className="goal-top">
                            <div className="goal-title">{g.title}</div>
                            <div className="goal-percent">{progress}%</div>
                          </div>
                          <div className="goal-meta">
                            <span className="goal-pill">{g.status}</span>
                            <span className="goal-due">Due: {g.dueDate ?? "—"}</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </aside>
            </>
          )}
        </>
      )}
    </div>
  );
}

