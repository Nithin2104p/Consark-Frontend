import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useTranslation } from "../hooks/useTranslation";
import { Card } from "./Card";
import { CHART_COLORS } from "../constants/ui";
import type { TaskCountsDto } from "../services/task.service";

type ProductivityChartProps = {
  counts: TaskCountsDto;
};

export function ProductivityChart({ counts }: ProductivityChartProps) {
  const { t } = useTranslation();

  const pieData = [
    { key: "completed", value: counts.completedTasks, color: CHART_COLORS.completed },
    { key: "inProgress", value: counts.inProgressTasks, color: CHART_COLORS.inProgress },
    { key: "open", value: counts.openTasks, color: CHART_COLORS.open },
  ] as const;

  return (
    <Card title={t("cards.productivity")}>
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
