import { Link } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";

export function UnauthorizedPage() {
  const { t } = useTranslation();

  return (
    <div className="page center">
      <h1>{t("auth.unauthorizedTitle")}</h1>
      <p className="muted">{t("auth.unauthorizedMessage")}</p>
      <Link to="/tasks" className="btn">
        {t("auth.backToTasks")}
      </Link>
    </div>
  );
}
