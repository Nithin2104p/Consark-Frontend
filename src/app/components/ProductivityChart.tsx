import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useTranslation } from "../hooks/useTranslation";
import { Card } from "./Card";
import { getTaskCounts, type TaskCountsDto } from "../services/task.service";

type PieDataItem = {
  key: string;
  value: number;
  color: string;
};

export function ProductivityChart() {
  const { t } = useTranslation();
  const [counts, setCounts] = useState<TaskCountsDto>({
    totalTasks: 0,
    openTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
  });

  useEffect(() => {
    void (async () => {
      try {
        const data = await getTaskCounts();
        setCounts(data);
      } catch {
        // Keep default values on error
      }
    })();
  }, []);

  const pieData: PieDataItem[] = [
    { key: "completed", value: counts.completedTasks, color: "#06b6d4" },
    { key: "inProgress", value: counts.inProgressTasks, color: "#8b5cf6" },
    { key: "open", value: counts.openTasks, color: "#ec4899" },
  ];

  return (
    <Card title={t("cards.productivity")} actionLabel={t("actions.viewDetails")}>
      <div className="globe-wrap">
        <div className="split">
          <div className="pie-wrap">
            <div className="pie">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData.map((item) => ({
                      ...item,
                      name: t(`pie.${item.key}`),
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-center">
                <div className="big">{counts.totalTasks}</div>
                <div className="small">{t("productivity.totalRequests")}</div>
              </div>
            </div>
            <div className="legend">
              {pieData.map((item) => (
                <div key={item.key} className="legend-item">
                  <div className="dot" style={{ background: item.color }} />
                  <div>
                    <div className="small">{t(`pie.${item.key}`)}</div>
                    <div>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
