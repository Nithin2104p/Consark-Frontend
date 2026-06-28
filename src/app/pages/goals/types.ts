export type Task = {
  id: string;
  goalId: string;
  title: string;
  owner: string;
  status: "in-progress" | "completed" | "inactive" | "at-risk" | "delayed";
  visibility: "private" | "public" | "team" | "custom";
};

export type GoalTask = Task;

export type GoalItem = {
  id: string;
  title: string;
  owner: string;
  description?: string;
  level: "individual" | "team" | "org";
  status:
  | "on-track"
  | "at-risk"
  | "delayed"
  | "in-progress"
  | "completed"
  | "archived"
  | "inactive";
  visibility: "private" | "public" | "team" | "custom";
  dueDate?: string;
  Goals: GoalTask[];
};

