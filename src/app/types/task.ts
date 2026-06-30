export type TaskPriority = "Low" | "Medium" | "High";
export type TaskStatus = "Open" | "In-Progress" | "Completed";

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  assignedTo?: string;
};

export type TaskInput = {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo?: string;
};

export type TaskFilters = {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  createdBy?: string;
  assignedTo?: string;
};

export type TasksResponse = {
  Tasks: Task[];
  total: number;
};

export const TASK_PRIORITIES: TaskPriority[] = ["Low", "Medium", "High"];
export const TASK_STATUSES: TaskStatus[] = ["Open", "In-Progress", "Completed"];

export const DEFAULT_TASK_PRIORITY: TaskPriority = "Medium";
export const DEFAULT_TASK_STATUS: TaskStatus = "Open";

export const TASK_STATUS_I18N_KEY: Record<TaskStatus, string> = {
  Open: "open",
  "In-Progress": "inProgress",
  Completed: "completed",
};

export const TASK_PRIORITY_I18N_KEY: Record<TaskPriority, string> = {
  Low: "low",
  Medium: "medium",
  High: "high",
};
