import { apiClient, TOKEN_KEY } from "./client";
import type { AuthUser, LoginCredentials, SignupCredentials } from "../types/auth";

const USER_KEY = "consark_user";

type AuthResponse = {
    token?: string;
    accessToken?: string;
    user?: AuthUser;
};

function extractToken(data: AuthResponse): string {
    const token = data.token ?? data.accessToken;
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
    persistAuth(token, data.user);
    return data.user ?? { email: credentials.email };
}

export async function signup(credentials: SignupCredentials): Promise<AuthUser> {
    const { data } = await apiClient.post<AuthResponse>("/auth/signup", credentials);
    const token = extractToken(data);
    persistAuth(token, data.user);
    return data.user ?? { email: credentials.email, name: credentials.name };
}

export function logout() {
    clearAuthStorage();
}

