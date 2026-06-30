import { apiClient } from "./client";
import {
  DEFAULT_TASK_PRIORITY,
  DEFAULT_TASK_STATUS,
  type Task,
  type TaskFilters,
  type TaskInput,
  type TasksResponse,
} from "../types/task";

function normalizeTask(raw: Record<string, unknown>): Task {
  return {
    id: String(raw.id ?? raw._id ?? ""),
    title: String(raw.title ?? ""),
    description: String(raw.description ?? ""),
    priority: (raw.priority as Task["priority"]) ?? DEFAULT_TASK_PRIORITY,
    status: (raw.status as Task["status"]) ?? DEFAULT_TASK_STATUS,
    createdAt: String(raw.createdAt ?? ""),
    updatedAt: String(raw.updatedAt ?? ""),
    createdBy: raw.createdBy != null ? String(raw.createdBy) : undefined,
    assignedTo: raw.assignedTo != null ? String(raw.assignedTo) : undefined,
  };
}

function unwrapTaskPayload(data: unknown): Record<string, unknown> {
  const payload = data as Record<string, unknown>;
  return ((payload.task ?? payload.data) as Record<string, unknown>) ?? payload;
}

function normalizeTasksResponse(data: unknown): TasksResponse {
  if (Array.isArray(data)) {
    return { Tasks: data.map((item) => normalizeTask(item as Record<string, unknown>)), total: data.length };
  }

  const payload = data as Record<string, unknown>;
  const nested = payload.data as Record<string, unknown> | undefined;
  const source = nested ?? payload;

  const list = (source.tasks ?? source.Tasks ?? source.data ?? []) as Record<string, unknown>[];
  const Tasks = list.map(normalizeTask);

  const pagination = (source.pagination ?? {}) as Record<string, unknown>;
  const total = typeof pagination.total === "number" ? pagination.total : Tasks.length;

  return { Tasks, total };
}

export type TaskCountsDto = {
  totalTasks: number;
  openTasks: number;
  inProgressTasks: number;
  completedTasks: number;
};

export const EMPTY_TASK_COUNTS: TaskCountsDto = {
  totalTasks: 0,
  openTasks: 0,
  inProgressTasks: 0,
  completedTasks: 0,
};

export async function getTasks(filters: TaskFilters = {}): Promise<TasksResponse> {
  const params: Record<string, string | number> = {};

  if (filters.page != null) params.page = filters.page;
  if (filters.limit != null) params.limit = filters.limit;
  if (filters.sort) params.sort = filters.sort;
  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.priority) params.priority = filters.priority;
  if (filters.createdBy) params.createdBy = filters.createdBy;
  if (filters.assignedTo) params.assignedTo = filters.assignedTo;

  const { data } = await apiClient.get("/tasks", { params });
  return normalizeTasksResponse(data);
}

export async function getTaskById(id: string): Promise<Task> {
  const { data } = await apiClient.get(`/tasks/${id}`);
  return normalizeTask(unwrapTaskPayload(data));
}

export async function createTask(input: TaskInput): Promise<Task> {
  const { data } = await apiClient.post("/tasks", input);
  return normalizeTask(unwrapTaskPayload(data));
}

export async function updateTask(id: string, input: Partial<TaskInput>): Promise<Task> {
  const { data } = await apiClient.put(`/tasks/${id}`, input);
  return normalizeTask(unwrapTaskPayload(data));
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`);
}

export async function getTaskCounts(assignedTo?: string): Promise<TaskCountsDto> {
  const params: Record<string, string> = {};
  if (assignedTo) {
    params.assignedTo = assignedTo;
  }
  const { data } = await apiClient.get("/tasks/count", { params });
  return (data as { data?: TaskCountsDto }).data ?? (data as TaskCountsDto);
}
