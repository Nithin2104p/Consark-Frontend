import { apiClient } from "./client";
import type { Task } from "../types/task";

export type UserDto = {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
  isActive?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  location?: string;
};

export type UserCountDto = { count: number };

export type CreateUserPayload = {
  firstName: string;
  lastName?: string | null;
  email: string;
  password: string;
  companyName: string;
  isActive: boolean;
  roleId?: string;
  location?: string;
};

export type UserFilters = {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  isActive?: boolean;
};

export type UsersListResponse = {
  users: UserDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type UserWithTasksDto = UserDto & {
  tasks?: Task[];
};

export async function createUser(payload: CreateUserPayload): Promise<UserDto> {
  const { data } = await apiClient.post("/users", payload);
  const raw = (data as Record<string, unknown>).user ?? data;
  return {
    _id: String(raw._id ?? raw.id ?? ""),
    email: String(raw.email ?? payload.email),
    firstName: raw.firstName != null ? String(raw.firstName) : payload.firstName,
    lastName: raw.lastName != null ? String(raw.lastName) : payload.lastName ?? undefined,
    roleId: raw.roleId != null ? String(raw.roleId) : undefined,
    isActive: raw.isActive != null ? Boolean(raw.isActive) : payload.isActive,
    status: raw.status != null ? String(raw.status) : undefined,
    createdAt: raw.createdAt != null ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt != null ? String(raw.updatedAt) : undefined,
    deletedAt: raw.deletedAt != null ? String(raw.deletedAt) : null,
    location: raw.location != null ? String(raw.location) : payload.location ?? undefined,
  };
  }

export async function getUsers(filters: UserFilters = {}): Promise<UsersListResponse> {
  const params: Record<string, string | number> = {};
  if (filters.page != null) params.page = filters.page;
  if (filters.limit != null) params.limit = filters.limit;
  if (filters.sort) params.sort = filters.sort;
  if (filters.search) params.search = filters.search;
  if (filters.isActive != null) params.isActive = filters.isActive ? "true" : "false";

  const { data } = await apiClient.get("/users", { params });
  const payload = data as Record<string, unknown>;
  const nested = (payload.data ?? {}) as Record<string, unknown>;
  const list = (nested.users ?? nested.data ?? []) as UserDto[];
  const pagination = (nested.pagination ?? {}) as Record<string, unknown>;

  return {
    users: list,
    pagination: {
      page: typeof pagination.page === "number" ? pagination.page : filters.page ?? 1,
      limit: typeof pagination.limit === "number" ? pagination.limit : filters.limit ?? list.length,
      total: typeof pagination.total === "number" ? pagination.total : list.length,
      totalPages: typeof pagination.totalPages === "number" ? pagination.totalPages : 1,
    },
  };
}

export async function getUserById(id: string): Promise<UserWithTasksDto> {
  const { data } = await apiClient.get<{ data: { user: UserDto; tasks: Task[] } }>(`/users/${id}`);
  const user = data.data.user;
  return {
    ...user,
    tasks: data.data.tasks ?? [],
  };
}

export async function getUserCount(): Promise<number> {
  const { data } = await apiClient.get<{ data: UserCountDto }>("/users/count");
  return Number(data?.data?.count ?? 0);
}
