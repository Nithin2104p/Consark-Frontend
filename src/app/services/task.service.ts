import { apiClient } from "./client";
import type { Task, TaskFilters, TaskInput, TasksResponse } from "../types/task";

function normalizeTask(raw: Record<string, unknown>): Task {
    return {
        id: String(raw.id ?? raw._id ?? ""),
        title: String(raw.title ?? ""),
        description: String(raw.description ?? ""),
        priority: (raw.priority as Task["priority"]) ?? "Medium",
        status: (raw.status as Task["status"]) ?? "Open",
        createdAt: String(raw.createdAt ?? ""),
        updatedAt: String(raw.updatedAt ?? ""),
        createdBy: raw.createdBy != null ? String(raw.createdBy) : undefined,
        assignedTo: raw.assignedTo != null ? String(raw.assignedTo) : undefined,
    };
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
    const payload = data as Record<string, unknown>;
    const raw = ((payload.task ?? payload.data) as Record<string, unknown>) ?? data;
    return normalizeTask(raw);
}

export async function createTask(input: TaskInput): Promise<Task> {
    const { data } = await apiClient.post("/tasks", input);
    const payload = data as Record<string, unknown>;
    const raw = ((payload.task ?? payload.data) as Record<string, unknown>) ?? data;
    return normalizeTask(raw);
}

export async function updateTask(id: string, input: Partial<TaskInput>): Promise<Task> {
    const { data } = await apiClient.put(`/tasks/${id}`, input);
    const payload = data as Record<string, unknown>;
    const raw = ((payload.task ?? payload.data) as Record<string, unknown>) ?? data;
    return normalizeTask(raw);
}

export async function deleteTask(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
}

export async function getTaskStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    completed: number;
}> {
    const { Tasks, total } = await getTasks({ limit: 1000 });

    const open = Tasks.filter((t) => t.status === "Open").length;
    const inProgress = Tasks.filter((t) => t.status === "In-Progress").length;
    const completed = Tasks.filter((t) => t.status === "Completed").length;

    return {
        total: total || Tasks.length,
        open,
        inProgress,
        completed,
    };
}

export type TaskCountsDto = {
    totalTasks: number;
    openTasks: number;
    inProgressTasks: number;
    completedTasks: number;
};

export async function getTaskCounts(assignedTo?: string): Promise<TaskCountsDto> {
    const params: Record<string, string> = {};
    if (assignedTo) {
        params.assignedTo = assignedTo;
    }
    const { data } = await apiClient.get("/tasks/count", { params });
    return (data as { data?: TaskCountsDto }).data ?? (data as TaskCountsDto);
}
