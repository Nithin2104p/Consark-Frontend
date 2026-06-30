import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { GlobeCard } from "../../components/GlobeCard";
import { ProductivityChart } from "../../components/ProductivityChart";
import { PageHeader } from "../../components/PageHeader";
import { KpiCards } from "../../components/overview/KpiCards";
import { EMPLOYEE_ROLES } from "../../auth/permissions";
import { useAuth } from "../../auth/AuthContext";
import { useTranslation } from "../../hooks/useTranslation";
import { EMPTY_TASK_COUNTS, getTaskCounts, type TaskCountsDto } from "../../services/task.service";

export function Dashboard() {
  const { t } = useTranslation();
  const { user, role } = useAuth();
  const [counts, setCounts] = useState<TaskCountsDto>(EMPTY_TASK_COUNTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const isEmployee = EMPLOYEE_ROLES.includes(role);
      const userId = isEmployee && user?.id ? user.id : undefined;
      const data = await getTaskCounts(userId);
      setCounts(data);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? t("dashboard.loadError")
        : t("dashboard.loadError");
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [role, user, t]);

  useEffect(() => {
    void loadCounts();
  }, [loadCounts]);

  return (
    <div className="page">
      <PageHeader />
      <KpiCards counts={counts} loading={loading} error={error} onRetry={loadCounts} />

      <div className="grid cols-2">
        <GlobeCard />
        <ProductivityChart counts={counts} />
      </div>
    </div>
  );
}
