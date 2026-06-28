import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { Goals as initialGoals } from "./constants";

import { useAuth } from "../../auth/AuthContext";
import { hasPermission, PERMISSIONS } from "../../auth/permissions";
import { useTranslation } from "../../hooks/useTranslation";
import { employees } from "../../data/employees";
import type { GoalItem } from "./types";
import { validateGoalForm } from "./validation";
import "./GoalsPage.css";
import { GoalDetailsSidebar } from "../../components/GoalDetailsSidebar";

export function GoalsPage() {
  const { t } = useTranslation();
  const { role } = useAuth();
  const [items, setItems] = useState(initialGoals);

  const pageSize = 8;
  const [page, setPage] = useState(1);

  const visibleGoals = items.filter((g) => g.status !== "inactive");
  const totalPages = Math.max(1, Math.ceil(visibleGoals.length / pageSize));
  const safePage = Math.min(page, totalPages);




  // Keep selectedGoal in sync with list updates (task toggles/adds)

  // when the user edits goal fields from the form.
  const handleCloseAll = () => {
    setSelectedGoal(null);
    setIsOpen(false);
  };
  const [isOpen, setIsOpen] = useState(false);
  const [_editingId, setEditingId] = useState<string | null>(null);


  const [selectedGoal, setSelectedGoal] = useState<GoalItem | null>(null);


  const canCreate = hasPermission(role, PERMISSIONS.Goals_CREATE);

  type FormState = {
    title: string;
    owner: string;
    description: string;
    level: "individual" | "team" | "org";
    visibility: "private" | "public" | "team" | "custom";
    status:
    | "on-track"
    | "at-risk"
    | "delayed"
    | "in-progress"
    | "completed"
    | "archived"
    | "inactive";

    dueDate: string;
  };

  const initialForm: FormState = {
    title: "",
    owner: employees[0]?.name ?? "",
    description: "",
    level: "individual",
    visibility: "private",
    status: "on-track",
    dueDate: "",
  };

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((c) => ({ ...c, [key]: value }));
    // Clear error for this field when user starts typing
    if (errors[key]) {
      setErrors((e) => ({ ...e, [key]: "" }));
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setSelectedGoal(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (goal: GoalItem) => {
    setEditingId(goal.id);
    setSelectedGoal(goal);
    setIsOpen(false);
  };


  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validation = validateGoalForm(form);
    if (!validation.valid) {
      setErrors(validation.errors || {});
      toast.error("Please fix the form errors");
      return;
    }

    // Create new goal
    const newItem: GoalItem = {
      id: `goal-${crypto.randomUUID()}`,

      title: form.title,
      owner: form.owner,
      description: form.description,
      level: form.level,
      visibility: form.visibility,
      status: form.status,
      dueDate: form.dueDate || undefined,
      Goals: [],
    };
    setItems((s) => [newItem, ...s]);
    toast.success("Goal created successfully");

    setForm(initialForm);
    setErrors({});
    setEditingId(null);
    setIsOpen(false);
  };

  const handleUpdateSelectedGoal = (next: GoalItem) => {
    setItems((s) => s.map((g) => (g.id === next.id ? next : g)));
    setSelectedGoal(next);
  };


  const handleDelete = (id: string) => {
    setItems((s) => s.filter((item) => item.id !== id));
    toast.success("Goal deleted successfully");

    setIsOpen(false);
    setEditingId(null);
  };

  return (
    <div className="Goals-page">
      <div className="Goals-header">
        <div>
          <h1>{t("pages.Goals.title")}</h1>
          <p className="muted page-desc">{t("pages.Goals.description")}</p>
        </div>
        {canCreate && (
          <button className="new-request-button" onClick={handleOpenCreate}>
            + New goal
          </button>
        )}
      </div>

      <div className="Goals-table">
        <div className="table-header">


          <div>Goal</div>
          <div>Owner</div>
          <div>Level</div>
          <div>Status</div>
          <div>Visibility</div>
          <div>Due</div>
          <div>Action</div>
        </div>

        {visibleGoals
          .slice((safePage - 1) * pageSize, safePage * pageSize)
          .map((g) => (
            <div className="table-row" key={g.id}>


              <div>{g.title}</div>
              <div>{g.owner}</div>
              <div>{g.level}</div>
              <div>{g.status}</div>
              <div>{g.visibility}</div>
              <div>{g.dueDate ?? "—"}</div>
              <div className="row-actions">
                <button className="action-btn edit-btn" onClick={() => handleOpenEdit(g)} title="Edit">
                  Edit
                </button>
                {canCreate && (
                  <button className="action-btn delete-btn" onClick={() => handleDelete(g.id)} title="Delete">
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}

        <div className="Goals-pagination">
          <button
            className="pagination-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
          >
            Prev
          </button>

          <div className="pagination-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                className={`pagination-page-btn ${p === safePage ? "active" : ""}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>

            ))}
          </div>

          <button
            className="pagination-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {isOpen && !selectedGoal && (

        <>
          <div className="page-backdrop" onClick={() => handleCloseAll()} />
          <aside className="request-sidebar">

            <div className="sidebar-header">
              <h2>New goal</h2>
              <button type="button" className="sidebar-close" onClick={() => handleCloseAll()}>
                ×
              </button>
            </div>
            <form className="request-form" onSubmit={handleSubmit}>

              <div className="form-field">
                <label htmlFor="goal-title">Title</label>
                <input
                  id="goal-title"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className={errors.title ? "has-error" : ""}
                />
                {errors.title && <span className="error-message">{errors.title}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="goal-owner">Goal owner</label>
                <select
                  id="goal-owner"
                  value={form.owner}
                  onChange={(e) => handleChange("owner", e.target.value)}
                  className={errors.owner ? "has-error" : ""}
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.name}>
                      {emp.name}
                    </option>
                  ))}
                </select>
                {errors.owner && <span className="error-message">{errors.owner}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="goal-level">Goal level</label>
                <select
                  id="goal-level"
                  value={form.level}
                  onChange={(e) => handleChange("level", e.target.value)}
                  className={errors.level ? "has-error" : ""}
                >
                  <option value="individual">Individual</option>
                  <option value="team">Team</option>
                  <option value="org">Org</option>
                </select>
                {errors.level && <span className="error-message">{errors.level}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="goal-visibility">Visibility</label>
                <select
                  id="goal-visibility"
                  value={form.visibility}
                  onChange={(e) => handleChange("visibility", e.target.value)}
                  className={errors.visibility ? "has-error" : ""}
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                  <option value="team">Team</option>
                  <option value="custom">Custom</option>
                </select>
                {errors.visibility && <span className="error-message">{errors.visibility}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="goal-due">Due date</label>
                <input
                  id="goal-due"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => handleChange("dueDate", e.target.value)}
                  className={errors.dueDate ? "has-error" : ""}
                />
                {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="goal-desc">Description</label>
                <textarea
                  id="goal-desc"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={5}
                  className={errors.description ? "has-error" : ""}
                />
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>

              <div className="sidebar-actions">
                <button type="button" className="sidebar-cancel" onClick={() => setIsOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="sidebar-submit">
                  Create goal
                </button>
              </div>
            </form>
          </aside>
        </>
      )}

      {selectedGoal && (
        <GoalDetailsSidebar
          goal={selectedGoal}
          onClose={() => {
            setSelectedGoal(null);
            setIsOpen(false);
          }}
          onUpdateGoal={handleUpdateSelectedGoal}
          onDelete={(id) => {
            handleDelete(id);
            setSelectedGoal(null);
          }}
        />
      )}

    </div>
  );
}

