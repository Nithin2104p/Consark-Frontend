import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { incidents } from "../constants";
import { useTranslation } from "../hooks/useTranslation";
import { Card } from "./Card";

export function IncidentsCard() {
  const { t } = useTranslation();

  return (
    <Card title={t("cards.incidents")} actionLabel={t("actions.viewAll")}>
      {incidents.map((item) => (
        <div key={item.id} className="row">
          <div>
            <div>{item.ref}</div>
            <div className="small">{t(`incidents.${item.id}.user`)}</div>
            <div className="small">{t(`incidents.${item.id}.time`)}</div>
          </div>
          <span className={`tag ${item.up ? "ok" : "bad"}`}>
            {item.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {item.change}
          </span>
        </div>
      ))}
    </Card>
  );
}
