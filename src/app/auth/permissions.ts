import type { Role } from "../types";

export const ROLES = {
  SUPER_ADMIN: "superAdmin",
  SUPER_ADMIN_API: "super_admin",
  ADMIN: "admin",
  EMPLOYEE: "employee",
  USER: "user",
} as const;

export const PERMISSIONS = {
  OVERVIEW_VIEW: "overview:view",
  EMPLOYEES_VIEW: "employees:view",
  EMPLOYEES_EDIT: "employees:edit",
  TASKS_VIEW: "tasks:view",
  TASKS_CREATE: "tasks:create",
  TASKS_ASSIGN: "tasks:assign",
  SETTINGS_VIEW: "settings:view",
  SETTINGS_EDIT: "settings:edit",
} as const;

type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN_API]: ALL_PERMISSIONS,
  [ROLES.SUPER_ADMIN]: ALL_PERMISSIONS,
  [ROLES.ADMIN]: [
    PERMISSIONS.OVERVIEW_VIEW,
    PERMISSIONS.EMPLOYEES_VIEW,
    PERMISSIONS.EMPLOYEES_EDIT,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_ASSIGN,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
  ],
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.OVERVIEW_VIEW,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_CREATE,
  ],
  [ROLES.USER]: [PERMISSIONS.OVERVIEW_VIEW],
};

const ROUTE_PERMISSIONS: Record<string, Permission> = {
  overview: PERMISSIONS.OVERVIEW_VIEW,
  employees: PERMISSIONS.EMPLOYEES_VIEW,
  tasks: PERMISSIONS.TASKS_VIEW,
  settings: PERMISSIONS.SETTINGS_VIEW,
  config: PERMISSIONS.SETTINGS_VIEW,
};

export const EMPLOYEE_ROLES: Role[] = [ROLES.EMPLOYEE, ROLES.USER];

export function canAccess(role: Role, routeId: string) {
  const requiredPermission = ROUTE_PERMISSIONS[routeId];
  if (!requiredPermission) {
    return false;
  }
  return ROLE_PERMISSIONS[role]?.includes(requiredPermission) ?? false;
}

export function hasPermission(role: Role, permission: Permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export const ROLE_OPTIONS: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.EMPLOYEE,
  ROLES.USER,
];
