import { Goals } from "../constants";
import { useTranslation } from "../hooks/useTranslation";
import { Card } from "./Card";

function statusClass(status: string) {
  if (status === "completed") return "ok";
  if (status === "inProgress") return "info";
  return "gray";
}

export function TaskProgressCard() {
  const { t } = useTranslation();

  return (
    <Card title={t("cards.taskProgress")} actionLabel={t("actions.viewAll")}>
      {Goals.map((item) => (
        <div key={item.id} className="row">
          <div>
            <div>{t(`Goals.${item.id}.name`)}</div>
            <div className="small">{t(`Goals.${item.id}.team`)}</div>
          </div>
          <div className="right">
            <span className={`tag ${statusClass(item.status)}`}>
              {t(`status.${item.status}`)}
            </span>
            <span className={`priority ${item.priority}`}>
              {t(`priority.${item.priority}`)}
            </span>
          </div>
        </div>
      ))}
    </Card>
  );
}
