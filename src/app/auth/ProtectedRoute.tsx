import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { canAccess } from "./permissions";
import { useTranslation } from "../hooks/useTranslation";
import { ROUTES } from "../constants/routes";
import type { ProtectedRouteProps } from "../types";

function AuthLoadingFallback() {
  const { t } = useTranslation();
  return (
    <div className="page center">
      <p className="muted">{t("common.loading")}</p>
    </div>
  );
}

export function ProtectedRoute({ routeId, children }: ProtectedRouteProps) {
  const { role } = useAuth();

  if (!canAccess(role, routeId)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <>{children}</>;
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return <AuthLoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authLoading } = useAuth();
  const { t } = useTranslation();

  if (authLoading) {
    return (
      <div className="auth-page center">
        <p className="muted">{t("common.loading")}</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
}
