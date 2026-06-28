import type { GoalItem, GoalTask } from "./types";

// NOTE: per requirements:
// - If goal.status is "archived" => goal is archived
// - If goal.status is "inactive" => goal is deleted/inactive (handled by filtering)
// - Task uses status only for completion weighting

export type GoalstatusLike =
  | "on-track"
  | "at-risk"
  | "delayed"
  | "in-progress"
  | "completed"
  | "archived"
  | "inactive";

export function isGoalArchived(goal: GoalItem): boolean {
  return (goal.status as GoalstatusLike) === "archived";
}

export function isGoalInactive(goal: GoalItem): boolean {
  return (goal.status as GoalstatusLike) === "inactive";
}

export function goalCompletionPercent(goal: GoalItem): number {
  const total = goal.Goals.length;
  if (total === 0) return 0;

  const completed = goal.Goals.filter((t) => t.status === "completed").length;
  return Math.round((completed / total) * 100);
}


export function toggleTaskCompleted(Goals: GoalTask[], taskId: string): GoalTask[] {
  return Goals.map((task) => {
    if (task.id !== taskId) return task;
    const nextStatus = task.status === "completed" ? "in-progress" : "completed";
    return { ...task, status: nextStatus };
  });
}


