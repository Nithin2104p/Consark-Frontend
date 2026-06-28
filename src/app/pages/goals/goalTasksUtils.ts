import type { GoalItem, GoalTask } from "./types";

export function addTaskToGoal(goal: GoalItem, taskTitle: string): GoalItem {
  const title = taskTitle.trim();
  if (!title) return goal;

  const newTask: GoalTask = {
    id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    goalId: goal.id,
    owner: goal.owner,
    status: "in-progress",
    visibility: goal.visibility,
  };


  return {
    ...goal,
    Goals: [newTask, ...goal.Goals],
  };
}

