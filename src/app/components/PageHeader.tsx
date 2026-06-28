import { ChevronRight } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

export function PageHeader() {
  const { t } = useTranslation();

  return (
    <>
      <h1>{t("page.title")}</h1>
      <div className="crumbs">
        <span>{t("page.dashboard")}</span>
        <ChevronRight size={14} />
        <span>{t("page.title")}</span>
      </div>
    </>
  );
}
