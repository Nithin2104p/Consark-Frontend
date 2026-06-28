import type { AuthUser, LoginCredentials, SignupCredentials } from "./types/auth";

export type Role = "admin" | "employee" | "superAdmin";

export type AuthContextValue = {
  role: Role;
  setRole: (role: Role) => void;
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  signup: (credentials: SignupCredentials) => Promise<AuthUser>;
  logout: () => void;
};

export type ProtectedRouteProps = {
  routeId: string;
  children: React.ReactNode;
};
