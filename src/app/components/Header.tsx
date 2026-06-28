import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "../hooks/useTranslation";
import { useAuth } from "../auth/AuthContext";
import { ROLES } from "../auth/permissions";
import type { Role } from "../types";

export function Header() {
  const { t } = useTranslation();
  const { role, setRole, user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info("Signed out.");
    navigate("/");
  };

  return (
    <header className="topbar">
      <div className="search">
        <p className="Consark">CONSARK</p>
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

        {isAuthenticated && user && (
          <div className="user-top">
            <div className="user-name">{user.name ?? user.email}</div>
          </div>
        )}

        <button
          type="button"
          className="icon-btn"
          aria-label={t("header.notifications")}
        >
          <Bell size={18} />
        </button>

        {isAuthenticated ? (
          <button type="button" className="icon-btn" aria-label="Sign out" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        ) : (
          <div className="avatar blue" />
        )}
      </div>
    </header>
  );
}
