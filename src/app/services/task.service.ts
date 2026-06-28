import { apiClient } from "./client";
import type { Task, TaskFilters, TaskInput, GoalsResponse } from "../types/task";

function normalizeTask(raw: Record<string, unknown>): Task {
    return {
        id: String(raw.id ?? raw._id ?? ""),
        title: String(raw.title ?? ""),
        description: String(raw.description ?? ""),
        priority: raw.priority as Task["priority"],
        status: raw.status as Task["status"],
        createdAt: String(raw.createdAt ?? ""),
        updatedAt: String(raw.updatedAt ?? ""),
        createdBy: raw.createdBy != null ? String(raw.createdBy) : undefined,
        assignedTo: raw.assignedTo != null ? String(raw.assignedTo) : undefined,
    };
}

function normalizeGoalsResponse(data: unknown): GoalsResponse {
    if (Array.isArray(data)) {
        return { Goals: data.map((item) => normalizeTask(item as Record<string, unknown>)), total: data.length };
    }

    const payload = data as Record<string, unknown>;
    const list = (payload.Goals ?? payload.data ?? []) as Record<string, unknown>[];
    const Goals = list.map(normalizeTask);
    const total = typeof payload.total === "number" ? payload.total : Goals.length;

    return { Goals, total };
}

export async function getGoals(filters: TaskFilters = {}): Promise<GoalsResponse> {
    const params: Record<string, string | number> = {};

    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.createdBy) params.createdBy = filters.createdBy;
    if (filters.assignedTo) params.assignedTo = filters.assignedTo;
    if (filters.limit != null) params.limit = filters.limit;
    if (filters.skip != null) params.skip = filters.skip;
    if (filters.sort) params.sort = filters.sort;

    const { data } = await apiClient.get("/Goals", { params });
    return normalizeGoalsResponse(data);
}

export async function getTaskById(id: string): Promise<Task> {
    const { data } = await apiClient.get(`/Goals/${id}`);
    const raw = (data as Record<string, unknown>).task ?? data;
    return normalizeTask(raw as Record<string, unknown>);
}

export async function createTask(input: TaskInput): Promise<Task> {
    const { data } = await apiClient.post("/Goals", input);
    const raw = (data as Record<string, unknown>).task ?? data;
    return normalizeTask(raw as Record<string, unknown>);
}

export async function updateTask(id: string, input: Partial<TaskInput>): Promise<Task> {
    const { data } = await apiClient.put(`/Goals/${id}`, input);
    const raw = (data as Record<string, unknown>).task ?? data;
    return normalizeTask(raw as Record<string, unknown>);
}

export async function deleteTask(id: string): Promise<void> {
    await apiClient.delete(`/Goals/${id}`);
}

export async function getGoalstats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    completed: number;
}> {
    const { Goals, total } = await getGoals({ limit: 1000 });

    const open = Goals.filter((t) => t.status === "Open").length;
    const inProgress = Goals.filter((t) => t.status === "In Progress").length;
    const completed = Goals.filter((t) => t.status === "Completed").length;

    return {
        total: total || Goals.length,
        open,
        inProgress,
        completed,
    };
}


export type TaskCountsDto = {
    totalGoals: number;
    openGoals: number;
    inProgressGoals: number;
    completedGoals: number;
};

type TaskCountsResponse = {
    statusCode: number;
    success: boolean;
    message: string;
    data: TaskCountsDto;
};

export async function getTaskCounts(): Promise<TaskCountsDto> {
    const { data } = await apiClient.get<TaskCountsResponse>("/tasks/count");
    return data.data;
}

