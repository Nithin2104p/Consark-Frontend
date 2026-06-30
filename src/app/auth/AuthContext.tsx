import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { setUnauthorizedHandler } from "../services/client";
import * as authService from "../services/auth.service";
import type { AuthUser, LoginCredentials, SignupCredentials } from "../types/auth";
import type { AuthContextValue, Role } from "../types";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(() => {
    const stored = authService.getStoredUser();
    return stored?.role ?? "superAdmin";
  });
  const [user, setUser] = useState<AuthUser | null>(() => authService.getStoredUser());
  const [token, setToken] = useState<string | null>(() => authService.getStoredToken());
  const [authLoading, setAuthLoading] = useState(true);

  const isAuthenticated = Boolean(token);

  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
    setRole("superAdmin");
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setUser(null);
      if (!window.location.pathname.startsWith("/")) {
        window.location.assign("/");
      }
    });
    // setAuthLoading(false) after first paint to avoid cascading render warnings
    queueMicrotask(() => setAuthLoading(false));
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const nextUser = await authService.login(credentials);
    setToken(authService.getStoredToken());
    setUser(nextUser);
    if (nextUser.role) {
      setRole(nextUser.role);
    }
    return nextUser;
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    const nextUser = await authService.signup(credentials);
    setToken(authService.getStoredToken());
    setUser(nextUser);
    if (nextUser.role) {
      setRole(nextUser.role);
    }
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
