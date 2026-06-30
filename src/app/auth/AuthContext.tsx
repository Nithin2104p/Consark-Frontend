import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { setUnauthorizedHandler } from "../services/client";
import * as authService from "../services/auth.service";
import { ROLES } from "./permissions";
import { ROUTES } from "../constants/routes";
import type { AuthUser, LoginCredentials, SignupCredentials } from "../types/auth";
import type { AuthContextValue, Role } from "../types";

const AuthContext = createContext<AuthContextValue | null>(null);

function applyAuthSession(
  setToken: (token: string | null) => void,
  setUser: (user: AuthUser | null) => void,
  setRole: (role: Role) => void,
  nextUser: AuthUser
) {
  setToken(authService.getStoredToken());
  setUser(nextUser);
  if (nextUser.role) {
    setRole(nextUser.role);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const storedUser = authService.getStoredUser();
  const [role, setRole] = useState<Role>(() => storedUser?.role ?? ROLES.SUPER_ADMIN);
  const [user, setUser] = useState<AuthUser | null>(() => storedUser);
  const [token, setToken] = useState<string | null>(() => authService.getStoredToken());
  const [authLoading, setAuthLoading] = useState(true);

  const isAuthenticated = Boolean(token);

  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
    setRole(ROLES.SUPER_ADMIN);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      window.location.assign(ROUTES.LOGIN);
    });
    queueMicrotask(() => setAuthLoading(false));
  }, [logout]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const nextUser = await authService.login(credentials);
    applyAuthSession(setToken, setUser, setRole, nextUser);
    return nextUser;
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    const nextUser = await authService.signup(credentials);
    applyAuthSession(setToken, setUser, setRole, nextUser);
    return nextUser;
  }, []);

  const value = useMemo(
    () => ({
      role,
      setRole,
      user,
      token,
      isAuthenticated,
      authLoading,
      login,
      signup,
      logout,
    }),
    [role, user, token, isAuthenticated, authLoading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
