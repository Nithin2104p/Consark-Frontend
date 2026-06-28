import type { Role } from "../types";

export const ROLES = {
  SUPER_ADMIN: "superAdmin",
  ADMIN: "admin",
  EMPLOYEE: "employee",
} as const;

export const PERMISSIONS = {
  OVERVIEW_VIEW: "overview:view",

  EMPLOYEES_VIEW: "employees:view",
  EMPLOYEES_EDIT: "employees:edit",



  APPROVALS_VIEW: "approvals:view",
  APPROVALS_EDIT: "approvals:edit",
  Goals_VIEW: "Goals:view",
  Goals_CREATE: "Goals:create",

  SETTINGS_VIEW: "settings:view",
  SETTINGS_EDIT: "settings:edit",
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: [
    ...Object.values(PERMISSIONS),
  ],

  [ROLES.ADMIN]: [
    PERMISSIONS.OVERVIEW_VIEW,

    PERMISSIONS.EMPLOYEES_VIEW,
    PERMISSIONS.EMPLOYEES_EDIT,



    PERMISSIONS.APPROVALS_VIEW,
    PERMISSIONS.APPROVALS_EDIT,
    PERMISSIONS.Goals_VIEW,
    PERMISSIONS.Goals_CREATE,
  ],

  [ROLES.EMPLOYEE]: [
    PERMISSIONS.APPROVALS_VIEW,
    PERMISSIONS.Goals_VIEW,
  ],
};

export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  overview: PERMISSIONS.OVERVIEW_VIEW,
  employees: PERMISSIONS.EMPLOYEES_VIEW,
  approvals: PERMISSIONS.APPROVALS_VIEW,
  Goals: PERMISSIONS.Goals_VIEW,
  settings: PERMISSIONS.SETTINGS_VIEW,
  config: PERMISSIONS.SETTINGS_VIEW,
};

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
