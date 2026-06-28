import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  Target,
  Menu,
  X,
  ListTodo,
  CheckSquare,
} from "lucide-react";
import { useState, useEffect } from "react";
import { canAccess } from "../auth/permissions";
import { useAuth } from "../auth/AuthContext";
import { navItems, taskNavItems } from "../constants";
import { useTranslation } from "../hooks/useTranslation";

const icons = {
  overview: LayoutDashboard,
  taskDashboard: LayoutDashboard,
  Goals: ListTodo,
  employees: Users,
  projects: FileText,
  analytics: BarChart3,

  Goals: Target,
  settings: Settings,
  checkSquare: CheckSquare,
};

export function Sidebar() {
  const { t } = useTranslation();
  const { role, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Sidebar should show only a single top-level item: Dashboard.
  // Task-related navigation remains visible only when authenticated.
  const visibleNav = navItems.filter((item) => canAccess(role, item.id));
  const visibleTaskNav = isAuthenticated ? taskNavItems : [];




  return (
    <>
      {isMobile && (
        <button
          className="sidebar-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {isMobile && isOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setIsOpen(false)}
        />
      )}


      <aside className={`sidebar ${isMobile && isOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="logo">{t("brand.initial")}</div>
          <strong>{t("brand.name")}</strong>
        </div>

        <nav className="nav">
          {visibleTaskNav.map((item) => {
            const Icon = icons[item.icon as keyof typeof icons];

            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => isMobile && setIsOpen(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    isMobile && setIsOpen(false);
                  }
                }}
              >
                <Icon size={18} aria-hidden="true" />
                {item.id === "taskDashboard" ? "Dashboard" : "Goals"}
              </NavLink>
            );
          })}

          {visibleNav.map((item) => {
            const Icon = icons[item.icon as keyof typeof icons];
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => isMobile && setIsOpen(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    isMobile && setIsOpen(false);
                  }
                }}
              >
                <Icon size={18} aria-hidden="true" />

                {t(`nav.${item.id}`)}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
