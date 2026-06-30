import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Circle, Loader2, ListTodo } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import { LoadingState } from "../LoadingState";
import { ErrorState } from "../ErrorState";
import axios from "axios";
import { getTaskCounts, type TaskCountsDto } from "../../services/task.service";
import { useAuth } from "../../auth/AuthContext";

type Kpi = {
    id: string;
    label: string;
    value: string;
    color: "purple" | "blue" | "cyan" | "pink";
    icon: React.ElementType;
};

export function KpiCards() {
    const { t } = useTranslation();
    const { user, role } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [counts, setCounts] = useState<TaskCountsDto>({
        totalTasks: 0,
        openTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
    });

    useEffect(() => {
        void (async () => {
            setLoading(true);
            setError(null);
            try {
                const isEmployee = role === "employee" || role === "user";
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
        })();
    }, [role, user]);

    const kpis: Kpi[] = useMemo(() => {
        return [
            {
                id: "totalTasks",
                label: t("cards.totalTasks"),
                value: String(counts.totalTasks),
                color: "purple",
                icon: ListTodo,
            },
            {
                id: "openTasks",
                label: t("cards.openTasks"),
                value: String(counts.openTasks),
                color: "blue",
                icon: Circle,
            },
            {
                id: "inProgressTasks",
                label: t("cards.inProgressTasks"),
                value: String(counts.inProgressTasks),
                color: "cyan",
                icon: Loader2,
            },
            {
                id: "completedTasks",
                label: t("cards.completedTasks"),
                value: String(counts.completedTasks),
                color: "pink",
                icon: CheckCircle,
            },
        ];
    }, [t, counts]);

    if (loading) return <LoadingState message={t("dashboard.loading")} />;
    if (error) return <ErrorState message={error} />;

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
