import { LogOut } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "../hooks/useTranslation";
import { useAuth } from "../auth/AuthContext";
import { ROLES } from "../auth/permissions";
import type { Role } from "../types";

function getInitial(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const first = trimmed.split(" ")[0];
  return first.charAt(0).toUpperCase();
}

export function Header() {
  const { t } = useTranslation();
  const { role, setRole, user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, [clearCloseTimer]);

  const handleMouseEnter = useCallback(() => {
    clearCloseTimer();
    setProfileOpen(true);
  }, [clearCloseTimer]);

  const handleMouseLeave = useCallback(() => {
    closeTimerRef.current = setTimeout(() => {
      setProfileOpen(false);
    }, 120);
  }, []);

  const handleLogout = () => {
    clearCloseTimer();
    setProfileOpen(false);
    logout();
    toast.info(t("header.signedOut"));
    navigate("/");
  };

  return (
    <header className="topbar">
      <div className="search">
        <p className="Consark">{user?.companyName ?? t("header.companyFallback")}</p>
      </div>
      <div className="actions">
        {!isAuthenticated && (
          <div className="role-switcher-top">
            <select
              id="role-select-top"
              className="role-select-top"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              {Object.values(ROLES).map((r) => (
                <option key={r} value={r}>
                  {t(`roles.${r}`)}
                </option>
              ))}
            </select>
          </div>
        )}

        {isAuthenticated && (
          <div
            className="profile-wrapper"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              className="profile-trigger"
              aria-label={t("header.openProfileMenu")}
            >
              <span className="profile-avatar">
                {user?.name ? getInitial(user.name) : user?.email?.charAt(0).toUpperCase()}
              </span>
            </button>
            {profileOpen && (
              <div className="profile-dropdown" role="menu">
                <div className="profile-header">
                  <span className="profile-avatar profile-avatar--lg">
                    {user?.name ? getInitial(user.name) : user?.email?.charAt(0).toUpperCase()}
                  </span>
                  <span className="profile-name">{user?.name ?? t("header.userFallback")}</span>
                </div>
                <button
                  type="button"
                  className="profile-logout"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>{t("header.logout")}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
