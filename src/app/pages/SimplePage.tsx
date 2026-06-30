import { EmployeesList } from "./employees/EmployeesList";
import { useTranslation } from "../hooks/useTranslation";

type SimplePageProps = {
  titleKey: string;
  descriptionKey: string;
};

export function SimplePage({ titleKey, descriptionKey }: SimplePageProps) {
  const { t } = useTranslation();

  if (titleKey === "pages.employees.title") {
    return <EmployeesList />;
  }

  return (
    <div className="page">
      <h1>{t(titleKey)}</h1>
      <p className="muted page-desc">{t(descriptionKey)}</p>
    </div>
  );
}
