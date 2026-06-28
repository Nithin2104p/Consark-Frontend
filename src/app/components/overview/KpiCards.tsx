import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Circle, Loader2, ListTodo } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import { LoadingState } from "../LoadingState";
import { ErrorState } from "../ErrorState";
import axios from "axios";
import { getTaskCounts, type TaskCountsDto } from "../../services/task.service";

type Kpi = {
    id: string;
    label: string;
    value: string;
    color: "purple" | "blue" | "cyan" | "pink";
    icon: React.ElementType;
};

export function KpiCards() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [counts, setCounts] = useState<TaskCountsDto>({
        totalGoals: 0,
        openGoals: 0,
        inProgressGoals: 0,
        completedGoals: 0,
    });

    useEffect(() => {
        void (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getTaskCounts();
                setCounts(data);
            } catch (err) {
                const message = axios.isAxiosError(err)
                    ? (err.response?.data as { message?: string })?.message ?? "Failed to load KPI cards."
                    : "Failed to load KPI cards.";
                setError(message);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const kpis: Kpi[] = useMemo(() => {
        return [
            {
                id: "totalGoals",
                label: t("cards.totalGoals"),
                value: String(counts.totalGoals),
                color: "purple",
                icon: ListTodo,
            },
            {
                id: "openGoals",
                label: t("cards.openGoals"),
                value: String(counts.openGoals),
                color: "blue",
                icon: Circle,
            },
            {
                id: "inProgressGoals",
                label: t("cards.inProgressGoals"),
                value: String(counts.inProgressGoals),
                color: "cyan",
                icon: Loader2,
            },
            {
                id: "completedGoals",
                label: t("cards.completedGoals"),
                value: String(counts.completedGoals),
                color: "pink",
                icon: CheckCircle,
            },
        ];
    }, [t, counts]);

    if (loading) return <LoadingState message="Loading dashboard..." />;
    if (error) return <ErrorState message={error} />;

    return (
        <div className="grid cols-4">
            {kpis.map((k) => {
                const Icon = k.icon;
                return (
                    <div key={k.id} className="card">
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