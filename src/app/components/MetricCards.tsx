import { TrendingUp, Users, CheckCircle } from "lucide-react";
import { metrics } from "../constants";
import { useTranslation } from "../hooks/useTranslation";

export function MetricCards() {
  const { t } = useTranslation();

  return (
    <div className="grid cols-4">
      {metrics.map((metric) => {
        const change = "changeKey" in metric ? t(metric.changeKey) : metric.change;

        return (
          <div key={metric.id} className="card">
            <div className="metric-top">
              <div className={`icon-box ${metric.color}`}>
                {metric.color === "cyan" ? <CheckCircle size={20} /> : <Users size={20} />}
              </div>
              <span className={`tag ${metric.color}`}>{change}</span>
            </div>
            <div className="big">{metric.value}</div>
            <div className="muted">{t(`metrics.${metric.id}.label`)}</div>
            <div className={`trend ${metric.color}`}>
              <TrendingUp size={14} />
              <span>{t(`metrics.${metric.id}.note`)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
