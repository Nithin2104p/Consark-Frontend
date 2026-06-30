import { apiClient, TOKEN_KEY } from "./client";
import type { AuthUser, LoginCredentials, SignupCredentials } from "../types/auth";

const USER_KEY = "consark_user";

type AuthResponse = {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data?: {
    user?: AuthUser;
    token?: string;
    accessToken?: string;
  };
  token?: string;
  accessToken?: string;
  user?: AuthUser;
};

function extractToken(data: AuthResponse): string {
  const token = data.token ?? data.accessToken ?? data.data?.token ?? data.data?.accessToken;
  if (!token) {
    throw new Error("Authentication response did not include a token.");
  }
  return token;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function persistAuth(token: string, user?: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", credentials);
  const token = extractToken(data);
  const user = data.user ?? data.data?.user;
  persistAuth(token, user);
  return user ?? { email: credentials.email };
}

export async function signup(credentials: SignupCredentials): Promise<AuthUser> {
  const { data } = await apiClient.post<AuthResponse>("/auth/signup", {
    firstName: credentials.firstName,
    lastName: credentials.lastName,
    email: credentials.email,
    password: credentials.password,
    companyName: credentials.companyName,
  });

  const token = extractToken(data);
  const user = data.user ?? data.data?.user;
  persistAuth(token, user);
  return user ?? { email: credentials.email, name: credentials.firstName };
}

type SetPasswordPayload = {
  token: string;
  password: string;
};

type SetPasswordResponse = {
  statusCode?: number;
  success?: boolean;
  message?: string;
};

export async function setPassword(payload: SetPasswordPayload): Promise<void> {
  const { data } = await apiClient.post<SetPasswordResponse>("/auth/set-password", {
    token: payload.token,
    password: payload.password,
  });

  if (!data.success) {
    throw new Error(data.message ?? "Failed to set password.");
  }
}

type CompanyDto = {
  _id: string;
  name: string;
  [key: string]: unknown;
};

type UserCompaniesResponse = {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data?: CompanyDto[];
};

export async function getUserCompaniesByEmail(email: string): Promise<CompanyDto[]> {
  const { data } = await apiClient.get<UserCompaniesResponse>("/users/me/companies", {
    params: { email },
  });

  if (!data.success || !Array.isArray(data.data)) {
    throw new Error(data.message ?? "Failed to load companies.");
  }

  return data.data;
}

export function logout() {
  clearAuthStorage();
}
