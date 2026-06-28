import { useMemo, useState } from "react";

import type { GoalItem, GoalTask } from "../pages/goals/types";
import { goalCompletionPercent } from "../pages/goals/goalUtils";
import { useTranslation } from "../hooks/useTranslation";

import "./GoalDetailsSidebar.css";


export type GoalDetailsSidebarProps = {
  goal: GoalItem;
  onClose: () => void;
  onUpdateGoal: (next: GoalItem) => void;
  onDelete?: (id: string) => void;
};

export function GoalDetailsSidebar({ goal, onClose, onUpdateGoal, onDelete }: GoalDetailsSidebarProps) {
  const { t: _t } = useTranslation();

  const [taskTitle, setTaskTitle] = useState("");
  const [editingField, setEditingField] = useState<string | null>(null);

  const progress = useMemo(() => goalCompletionPercent(goal), [goal]);

  const Goals = goal.Goals;

  const handleAddTask = () => {
    const title = taskTitle.trim();
    if (!title) return;

    const newTask: GoalTask = {

      id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      goalId: goal.id,
      title,
      owner: goal.owner,
      visibility: goal.visibility,
      status: "in-progress" as const,
    };

    onUpdateGoal({ ...goal, Goals: [newTask, ...goal.Goals] });
    setTaskTitle("");
  };

  const handleToggleTask = (taskId: string) => {
    const nextGoals = goal.Goals.map((task) => {
      if (task.id !== taskId) return task;
      // task.status is a string-union; keep it type-safe.
      const nextStatus: (typeof task)["status"] =
        task.status === "completed" ? "in-progress" : "completed";
      return { ...task, status: nextStatus };
    });

    onUpdateGoal({ ...goal, Goals: nextGoals });
  };

  const handleFieldChange = (field: keyof GoalItem, value: string | undefined) => {
    onUpdateGoal({ ...goal, [field]: value || undefined });
    setEditingField(null);
  };

  return (
    <>
      <div className="goal-details-backdrop" onClick={onClose} />
      <aside className="goal-details-sidebar">
        <div className="goal-details-header">
          <div>
            <h3 className="goal-details-title">{goal.title}</h3>
            <div className="goal-details-sub">
              <span className={`health-pill ${goal.status}`}>{goal.status}</span>
              <span className="dot" />
              <span className="muted">{progress}% progress</span>
            </div>
          </div>
          <button type="button" className="goal-details-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {/* Goal Details Section */}
        <div className="goal-details-section">
          <h4>Goal details</h4>
          <div className="goal-kv-list">
            <div className="goal-kv">
              <label className="kv-label">Title</label>
              {editingField === "title" ? (
                <input
                  className="kv-input"
                  value={goal.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleFieldChange("title", goal.title);
                    if (e.key === "Escape") setEditingField(null);
                  }}
                  autoFocus
                />
              ) : (
                <div className="kv-value" onClick={() => setEditingField("title")}>
                  {goal.title}
                </div>
              )}
            </div>

            <div className="goal-kv">
              <label className="kv-label">Owner</label>
              {editingField === "owner" ? (
                <input
                  className="kv-input"
                  value={goal.owner}
                  onChange={(e) => handleFieldChange("owner", e.target.value)}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleFieldChange("owner", goal.owner);
                    if (e.key === "Escape") setEditingField(null);
                  }}
                  autoFocus
                />
              ) : (
                <div className="kv-value" onClick={() => setEditingField("owner")}>
                  {goal.owner}
                </div>
              )}
            </div>

            <div className="goal-kv">
              <label className="kv-label">Level</label>
              {editingField === "level" ? (
                <select
                  className="kv-select"
                  value={goal.level}
                  onChange={(e) => handleFieldChange("level", e.target.value)}
                  onBlur={() => setEditingField(null)}
                  autoFocus
                >
                  <option value="individual">Individual</option>
                  <option value="team">Team</option>
                  <option value="org">Org</option>
                </select>
              ) : (
                <div className="kv-value" onClick={() => setEditingField("level")}>
                  {goal.level}
                </div>
              )}
            </div>

            <div className="goal-kv">
              <label className="kv-label">Visibility</label>
              {editingField === "visibility" ? (
                <select
                  className="kv-select"
                  value={goal.visibility}
                  onChange={(e) => handleFieldChange("visibility", e.target.value)}
                  onBlur={() => setEditingField(null)}
                  autoFocus
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                  <option value="team">Team</option>
                  <option value="custom">Custom</option>
                </select>
              ) : (
                <div className="kv-value" onClick={() => setEditingField("visibility")}>
                  {goal.visibility}
                </div>
              )}
            </div>

            <div className="goal-kv">
              <label className="kv-label">Status</label>
              {editingField === "status" ? (
                <select
                  className="kv-select"
                  value={goal.status}
                  onChange={(e) => handleFieldChange("status", e.target.value)}
                  onBlur={() => setEditingField(null)}
                  autoFocus
                >
                  <option value="on-track">On track</option>
                  <option value="at-risk">At risk</option>
                  <option value="delayed">Delayed</option>
                  <option value="in-progress">In progress</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                  <option value="inactive">Inactive</option>
                </select>
              ) : (
                <div className="kv-value" onClick={() => setEditingField("status")}>
                  {goal.status}
                </div>
              )}
            </div>

            <div className="goal-kv">
              <label className="kv-label">Due date</label>
              {editingField === "dueDate" ? (
                <input
                  type="date"
                  className="kv-input"
                  value={goal.dueDate || ""}
                  onChange={(e) => handleFieldChange("dueDate", e.target.value || undefined)}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setEditingField(null);
                    if (e.key === "Escape") setEditingField(null);
                  }}
                  autoFocus
                />
              ) : (
                <div className="kv-value" onClick={() => setEditingField("dueDate")}>
                  {goal.dueDate || "—"}
                </div>
              )}
            </div>

            <div className="goal-kv">
              <label className="kv-label">Description</label>
              {editingField === "description" ? (
                <textarea
                  className="kv-textarea"
                  value={goal.description || ""}
                  onChange={(e) => handleFieldChange("description", e.target.value || undefined)}
                  onBlur={() => setEditingField(null)}
                  autoFocus
                  rows={3}
                />
              ) : (
                <div className="kv-value desc" onClick={() => setEditingField("description")}>
                  {goal.description || "—"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Goals Section */}
        <div className="goal-details-section">
          <h4>Goals</h4>
          <div className="goal-details-Goals">
            {Goals.map((task) => {
              const pct = task.status === "completed" ? 100 : 0;
              return (
                <div key={task.id} className="goal-task-row">
                  <button
                    type="button"
                    className={`task-check ${task.status === "completed" ? "completed" : "in-progress"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleTask(task.id);
                    }}
                    aria-label={`Toggle task ${task.title}`}
                    title="Toggle complete"
                  />
                  <div className="task-body">
                    <div className="task-title">{task.title}</div>
                    <div className="task-meta">
                      <span className="task-status">{task.status}</span>
                      <span className="task-meta-sep">•</span>
                      <span className="task-owner">{task.owner}</span>
                      <span className="task-meta-sep">•</span>
                      <span className="task-visibility">{task.visibility}</span>
                    </div>
                  </div>
                  <div className="task-pct">{pct}%</div>
                </div>
              );
            })}
          </div>

          <div className="task-add">
            <input
              className="task-add-input"
              placeholder="New task title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTask();
                }
              }}
            />
            <button type="button" className="task-add-btn" onClick={handleAddTask}>
              +
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="goal-details-actions">
          <button type="button" className="goal-action-btn cancel-btn" onClick={onClose}>
            Close
          </button>
          {onDelete && (
            <button type="button" className="goal-action-btn delete-btn" onClick={() => onDelete(goal.id)}>
              Delete
            </button>
          )}
          <button type="button" className="goal-action-btn update-btn" onClick={onClose}>
            Update
          </button>
        </div>
      </aside>
    </>
  );
}

