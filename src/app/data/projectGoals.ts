import type { GoalItem } from "../pages/goals/types";

// Mapping between Projects and Goals.
// A project can have multiple Goals across different employees.
export const projectGoalMapping: Record<string, string[]> = {
  // alpha -> Goals from multiple employees
  alpha: ["emp-1-goal-2", "emp-2-goal-2", "emp-3-goal-1"],

  // beta -> mix of delayed/in-progress
  beta: ["emp-1-goal-4", "emp-4-goal-3", "emp-5-goal-2", "emp-2-goal-6"],

  // gamma -> mostly on-track/completed
  gamma: ["emp-1-goal-5", "emp-3-goal-2", "emp-2-goal-1", "emp-4-goal-2"],

  // delta -> in-progress + at-risk
  delta: ["emp-2-goal-3", "emp-5-goal-1", "emp-3-goal-3"],
};

// Helper: resolve Goals list for a project id.
export function getGoalsForProject(projectId: string, Goals: GoalItem[]): GoalItem[] {
  const goalIds = projectGoalMapping[projectId] ?? [];
  const byId = new Map(Goals.map((g) => [g.id, g] as const));
  return goalIds.map((id) => byId.get(id)).filter((g): g is (typeof Goals)[number] => Boolean(g));
}

