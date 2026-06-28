export type TaskPriority = "Low" | "Medium" | "High";
export type Goalstatus = "Open" | "In Progress" | "Completed";

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: Goalstatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  assignedTo?: string;
};

export type TaskInput = {
  title: string;
  description: string;
  priority: TaskPriority;
  status: Goalstatus;
};

export type TaskFilters = {
  status?: Goalstatus;
  priority?: TaskPriority;
  createdBy?: string;
  assignedTo?: string;
  limit?: number;
  skip?: number;
  sort?: string;
};

export type GoalsResponse = {
  Goals: Task[];
  total: number;
};

export const TASK_PRIORITIES: TaskPriority[] = ["Low", "Medium", "High"];
export const TASK_STATUSES: Goalstatus[] = ["Open", "In Progress", "Completed"];
