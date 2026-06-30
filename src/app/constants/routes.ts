export const ROUTES = {
  LOGIN: "/",
  SIGNUP: "/signup",
  SET_PASSWORD: "/set-password",
  DASHBOARD: "/dashboard",
  OVERVIEW: "/overview",
  TASKS: "/tasks",
  TASKS_NEW: "/tasks/new",
  EMPLOYEES: "/employees",
  CONFIG: "/config",
  UNAUTHORIZED: "/unauthorized",
} as const;

export const DEFAULT_POST_AUTH_PATH = ROUTES.DASHBOARD;
