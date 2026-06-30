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
