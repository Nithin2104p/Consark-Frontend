import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Settings, Target, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { canAccess } from "../auth/permissions";
import { useAuth } from "../auth/AuthContext";
import { navItems, taskNavItems } from "../constants";
import { MOBILE_BREAKPOINT } from "../constants/ui";
import { useTranslation } from "../hooks/useTranslation";

const icons = {
  taskDashboard: LayoutDashboard,
  tasks: Target,
  employees: Users,
  settings: Settings,
} as const;

type NavItem = (typeof taskNavItems)[number] | (typeof navItems)[number];

export function Sidebar() {
  const { t } = useTranslation();
  const { role, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const visibleNav = navItems.filter((item) => canAccess(role, item.id));
  const visibleTaskNav = isAuthenticated ? taskNavItems : [];
  const allNavItems: NavItem[] = [...visibleTaskNav, ...visibleNav];

  const closeOnMobile = () => {
    if (isMobile) setIsOpen(false);
  };

  return (
    <>
      {isMobile && (
        <button
          className="sidebar-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={t("sidebar.toggleMenu")}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {isMobile && isOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label={t("sidebar.closeMenu")}
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`sidebar ${isMobile && isOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="logo">{t("brand.initial")}</div>
          <strong>{t("brand.name")}</strong>
        </div>

        <nav className="nav">
          {allNavItems.map((item) => {
            const Icon = icons[item.icon as keyof typeof icons];
            const isConfig = item.id === "config";

            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={isConfig}
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={closeOnMobile}
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
