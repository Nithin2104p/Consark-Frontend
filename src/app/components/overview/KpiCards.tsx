import { CheckCircle, Circle, Loader2, ListTodo } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import { LoadingState } from "../LoadingState";
import { ErrorState } from "../ErrorState";
import type { TaskCountsDto } from "../../services/task.service";

type KpiCardsProps = {
  counts: TaskCountsDto;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

export function KpiCards({ counts, loading, error, onRetry }: KpiCardsProps) {
  const { t } = useTranslation();

  const kpis = [
    { id: "totalTasks", label: t("cards.totalTasks"), value: String(counts.totalTasks), color: "purple", icon: ListTodo },
    { id: "openTasks", label: t("cards.openTasks"), value: String(counts.openTasks), color: "blue", icon: Circle },
    { id: "inProgressTasks", label: t("cards.inProgressTasks"), value: String(counts.inProgressTasks), color: "cyan", icon: Loader2 },
    { id: "completedTasks", label: t("cards.completedTasks"), value: String(counts.completedTasks), color: "pink", icon: CheckCircle },
  ] as const;

  if (loading) return <LoadingState message={t("dashboard.loading")} />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  return (
    <div className="grid cols-4">
      {kpis.map((k) => {
        const Icon = k.icon;
        return (
          <div key={k.id} className="card kpi-card">
            <div className="metric-top">
              <div className={`icon-box ${k.color}`}>
                <Icon size={20} />
              </div>
            </div>
            <div className="big">{k.value}</div>
            <div className="muted">{k.label}</div>
          </div>
        );
      })}
    </div>
  );
}
