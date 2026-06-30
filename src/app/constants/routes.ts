export const ROUTES = {
  LOGIN: "/",
  SIGNUP: "/signup",
  SET_PASSWORD: "/set-password",
  DASHBOARD: "/dashboard",
  OVERVIEW: "/overview",
  TASKS: "/tasks",
  TASKS_NEW: "/tasks/new",
  TASKS_EDIT: "/tasks/:id/edit",
  EMPLOYEES: "/employees",
  CONFIG: "/config",
  UNAUTHORIZED: "/unauthorized",
} as const;

export const DEFAULT_POST_AUTH_PATH = ROUTES.DASHBOARD;

export function taskEditPath(id: string): string {
  return `/tasks/${id}/edit`;
}
