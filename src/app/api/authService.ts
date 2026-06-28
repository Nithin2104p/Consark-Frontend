import { apiClient, TOKEN_KEY } from "../services/client";
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
  const { confirmPassword, ...rest } = credentials;

  // Backend expected payload:
  // {
  //   firstName: string,
  //   lastName?: string,
  //   email: string,
  //   password: string,
  // }
  const { data } = await apiClient.post<AuthResponse>("/auth/signup", {
    firstName: rest.firstName,
    lastName: rest.lastName,
    email: rest.email,
    password: rest.password,
  });

  const token = extractToken(data);
  const user = data.user ?? data.data?.user;
  persistAuth(token, user);
  return user ?? { email: credentials.email, name: credentials.firstName };
}



export function logout() {
  clearAuthStorage();
}
