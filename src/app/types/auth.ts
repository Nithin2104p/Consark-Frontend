import type { Role } from "../types";

export type AuthUser = {
  id?: string;
  email: string;
  name?: string;
  companyName?: string;
  role?: Role;
};

export type LoginCredentials = {
  email: string;
  password: string;
  companyId: string;
};

export type SignupCredentials = {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
};

