import { IncidentsCard } from "../../components/IncidentsCard";
import { OverloadedEmployeesCard } from "../../components/OverloadedEmployeesCard";
import { PendingApprovalsCard } from "../../components/PendingApprovalsCard";
import { useTranslation } from "../../hooks/useTranslation";

export function AnalyticsPage() {
  const { t } = useTranslation();

  return (
    <div className="page">
      <h1>{t("pages.analytics.title")}</h1>
      <p className="muted page-desc">{t("pages.analytics.description")}</p>
    </div>
  );
}


